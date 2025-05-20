/**
 * Authentication Service for LARO-Hub
 * Handles JWT token management, user authentication state, and API requests
 */

class AuthService {
    constructor() {
        this.accessToken = localStorage.getItem('access');
        this.refreshToken = localStorage.getItem('refresh');
        this.user = JSON.parse(localStorage.getItem('currentUser') || 'null');
        this.refreshPromise = null;
        this.listeners = [];

        // Check token expiration on initialization
        this.checkTokenExpiration();
    }

    /**
     * Parse JWT token to get payload
     * @param {string} token - JWT token
     * @returns {object|null} Parsed token payload or null if invalid
     */
    parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64).split('').map(c =>
                    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                ).join('')
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error('Error parsing JWT token:', e);
            return null;
        }
    }

    /**
     * Check if token is valid and not expired
     * @param {string} token - JWT token to check
     * @returns {boolean} True if token is valid and not expired
     */
    isTokenValid(token) {
        if (!token) return false;

        const payload = this.parseJwt(token);
        if (!payload) return false;

        const now = Math.floor(Date.now() / 1000);
        return payload.exp > now;
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} True if user is authenticated
     */
    isAuthenticated() {
        return !!this.user && this.isTokenValid(this.accessToken);
    }

    /**
     * Get current user data
     * @returns {object|null} Current user data or null if not authenticated
     */
    getCurrentUser() {
        return this.user;
    }

    /**
     * Get access token, refreshing if necessary
     * @returns {Promise<string>} Promise resolving to access token
     */
    async getAccessToken() {
        // If token is valid, return it
        if (this.isTokenValid(this.accessToken)) {
            return this.accessToken;
        }

        // If token is invalid but we have a refresh token, try to refresh
        if (this.refreshToken) {
            try {
                await this.refreshAccessToken();
                return this.accessToken;
            } catch (error) {
                this.logout();
                throw new Error('Authentication failed. Please log in again.');
            }
        }

        throw new Error('Not authenticated');
    }

    /**
     * Refresh access token using refresh token
     * @returns {Promise<void>} Promise resolving when token is refreshed
     */
    async refreshAccessToken() {
        // If already refreshing, return the existing promise
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        this.refreshPromise = new Promise(async (resolve, reject) => {
            try {
                const response = await fetch('/api/token/refresh/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refresh: this.refreshToken }),
                });

                if (!response.ok) {
                    throw new Error('Failed to refresh token');
                }

                const data = await response.json();

                // Update tokens
                this.accessToken = data.access;
                localStorage.setItem('access', data.access);

                // If we got a new refresh token, update it
                if (data.refresh) {
                    this.refreshToken = data.refresh;
                    localStorage.setItem('refresh', data.refresh);
                }

                resolve();
            } catch (error) {
                console.error('Error refreshing token:', error);
                reject(error);
            } finally {
                this.refreshPromise = null;
            }
        });

        return this.refreshPromise;
    }

    /**
     * Login user with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<object>} Promise resolving to user data
     */
    async login(email, password) {
        try {
            console.log('Sending login request to:', '/api/login/');

            const response = await fetch('/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            // Log the response status
            console.log('Login response status:', response.status);

            // Get the response data
            const responseData = await response.json();
            console.log('Login response data:', responseData);

            if (!response.ok) {
                // Create a more detailed error message
                let errorMessage = 'Login failed';

                if (responseData.error) {
                    errorMessage = responseData.error;
                } else if (typeof responseData === 'object') {
                    // Try to extract any field errors
                    const fieldErrors = Object.entries(responseData)
                        .filter(([key, value]) => Array.isArray(value) && value.length > 0)
                        .map(([key, value]) => `${key}: ${value.join(', ')}`)
                        .join('; ');

                    if (fieldErrors) {
                        errorMessage = fieldErrors;
                    }
                }

                const error = new Error(errorMessage);
                error.response = responseData;
                throw error;
            }

            // Store tokens and user data
            this.accessToken = responseData.tokens.access;
            this.refreshToken = responseData.tokens.refresh;
            this.user = responseData.user;

            localStorage.setItem('access', responseData.tokens.access);
            localStorage.setItem('refresh', responseData.tokens.refresh);
            localStorage.setItem('currentUser', JSON.stringify(responseData.user));

            // Notify listeners
            this.notifyListeners();

            return responseData.user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Register a new user
     * @param {object} userData - User registration data
     * @returns {Promise<object>} Promise resolving to user data
     */
    async register(userData) {
        try {
            console.log('Sending registration request to:', '/api/register/');
            console.log('Registration data:', {
                ...userData,
                password: '********' // Don't log the actual password
            });

            const response = await fetch('/api/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            // Log the response status
            console.log('Registration response status:', response.status);

            // Get the response data
            const responseData = await response.json();
            console.log('Registration response data:', responseData);

            if (!response.ok) {
                // Create a more detailed error message
                let errorMessage = 'Registration failed';

                if (responseData.error) {
                    errorMessage = responseData.error;
                } else if (responseData.email) {
                    // Handle field-specific errors
                    errorMessage = `Email error: ${responseData.email}`;
                } else if (responseData.password) {
                    errorMessage = `Password error: ${responseData.password}`;
                } else if (responseData.firstname) {
                    errorMessage = `First name error: ${responseData.firstname}`;
                } else if (responseData.lastname) {
                    errorMessage = `Last name error: ${responseData.lastname}`;
                } else if (typeof responseData === 'object') {
                    // Try to extract any field errors
                    const fieldErrors = Object.entries(responseData)
                        .filter(([key, value]) => Array.isArray(value) && value.length > 0)
                        .map(([key, value]) => `${key}: ${value.join(', ')}`)
                        .join('; ');

                    if (fieldErrors) {
                        errorMessage = fieldErrors;
                    }
                }

                const error = new Error(errorMessage);
                error.response = responseData;
                throw error;
            }

            // Store tokens and user data
            this.accessToken = responseData.tokens.access;
            this.refreshToken = responseData.tokens.refresh;
            this.user = responseData.user;

            localStorage.setItem('access', responseData.tokens.access);
            localStorage.setItem('refresh', responseData.tokens.refresh);
            localStorage.setItem('currentUser', JSON.stringify(responseData.user));

            // Notify listeners
            this.notifyListeners();

            return responseData.user;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            // Only call logout API if we have a refresh token
            if (this.refreshToken) {
                await fetch('/api/logout/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.accessToken}`,
                    },
                    body: JSON.stringify({ refresh: this.refreshToken }),
                }).catch(err => console.error('Error during logout API call:', err));
            }
        } finally {
            // Clear tokens and user data regardless of API call result
            this.accessToken = null;
            this.refreshToken = null;
            this.user = null;

            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            localStorage.removeItem('currentUser');

            // Notify listeners
            this.notifyListeners();
        }
    }

    /**
     * Make authenticated API request
     * @param {string} url - API endpoint URL
     * @param {object} options - Fetch options
     * @returns {Promise<Response>} Fetch response
     */
    async apiRequest(url, options = {}) {
        try {
            // Get a valid access token
            const token = await this.getAccessToken();

            // Set up headers with authentication
            const headers = {
                ...options.headers,
                'Authorization': `Bearer ${token}`,
            };

            // Make the request
            const response = await fetch(url, {
                ...options,
                headers,
            });

            // Handle 401 Unauthorized by logging out
            if (response.status === 401) {
                this.logout();
                throw new Error('Authentication failed. Please log in again.');
            }

            return response;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    /**
     * Check token expiration and set up refresh timer
     */
    checkTokenExpiration() {
        if (!this.accessToken) return;

        const payload = this.parseJwt(this.accessToken);
        if (!payload) return;

        const expiresIn = payload.exp - Math.floor(Date.now() / 1000);

        // If token is expired, try to refresh immediately
        if (expiresIn <= 0) {
            this.refreshAccessToken().catch(() => this.logout());
            return;
        }

        // Set up timer to refresh token before it expires
        // Refresh when 90% of the token lifetime has passed
        const refreshTime = expiresIn * 0.9 * 1000;
        setTimeout(() => {
            this.refreshAccessToken().catch(() => this.logout());
        }, refreshTime);
    }

    /**
     * Add authentication state change listener
     * @param {Function} listener - Callback function
     */
    addListener(listener) {
        this.listeners.push(listener);
    }

    /**
     * Remove authentication state change listener
     * @param {Function} listener - Callback function to remove
     */
    removeListener(listener) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    /**
     * Notify all listeners of authentication state change
     */
    notifyListeners() {
        this.listeners.forEach(listener => {
            try {
                listener(this.isAuthenticated(), this.user);
            } catch (error) {
                console.error('Error in auth listener:', error);
            }
        });
    }
}

// Create and export a singleton instance
const authService = new AuthService();
window.authService = authService; // Make it globally available

export default authService;
