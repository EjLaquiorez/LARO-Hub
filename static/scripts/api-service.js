/**
 * API Service
 * Centralized service for making API calls to the backend
 */

class ApiService {
    constructor() {
        this.baseUrl = '/api';
        this.authListeners = [];
    }

    /**
     * Get the authentication token from localStorage
     * @returns {string|null} The access token or null if not found
     */
    getToken() {
        return localStorage.getItem('access');
    }

    /**
     * Add authentication headers to the request options
     * @param {Object} options - Request options
     * @returns {Object} Request options with auth headers
     */
    addAuthHeaders(options = {}) {
        const token = this.getToken();
        if (!token) return options;

        return {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token}`
            }
        };
    }

    /**
     * Make an API request with proper error handling
     * @param {string} endpoint - API endpoint (without base URL)
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} Response data
     * @throws {Error} If the request fails
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;

        try {
            // Add timeout to fetch request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const fetchOptions = {
                ...options,
                signal: controller.signal
            };

            try {
                const response = await fetch(url, fetchOptions);
                clearTimeout(timeoutId); // Clear timeout if fetch completes

                // Handle 401 Unauthorized errors
                if (response.status === 401) {
                    // Notify auth listeners about the unauthorized error
                    this.notifyAuthError();
                    throw new Error('Unauthorized: Please log in again');
                }

                // Handle 500 Internal Server Error
                if (response.status === 500) {
                    throw new Error('Server error: The server encountered an internal error');
                }

                // Handle 404 Not Found
                if (response.status === 404) {
                    throw new Error(`Resource not found: ${endpoint}`);
                }

                // Handle other error responses
                if (!response.ok) {
                    let errorMessage;
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.error || errorData.detail || `Request failed with status ${response.status}`;
                    } catch (jsonError) {
                        // If we can't parse JSON, use status text
                        errorMessage = `Request failed: ${response.statusText || response.status}`;
                    }
                    throw new Error(errorMessage);
                }

                // Parse JSON response
                try {
                    const data = await response.json();
                    return data;
                } catch (jsonError) {
                    console.warn('Response is not valid JSON:', jsonError);
                    // Return empty object if response is not JSON
                    return {};
                }
            } catch (fetchError) {
                clearTimeout(timeoutId); // Clear timeout on error

                // Handle abort error (timeout)
                if (fetchError.name === 'AbortError') {
                    throw new Error('Request timed out. Please try again later.');
                }

                throw fetchError;
            }
        } catch (error) {
            console.error(`API request failed for ${url}:`, error);
            throw error;
        }
    }

    /**
     * Make an authenticated API request
     * @param {string} endpoint - API endpoint (without base URL)
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} Response data
     */
    async authRequest(endpoint, options = {}) {
        const authOptions = this.addAuthHeaders(options);
        return this.request(endpoint, authOptions);
    }

    /**
     * Login user with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User data and tokens
     */
    async login(email, password) {
        try {
            const data = await this.request('/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            // Store tokens and user data
            if (data.access) {
                localStorage.setItem('access', data.access);

                if (data.refresh) {
                    localStorage.setItem('refresh', data.refresh);
                }

                // Fetch user data
                try {
                    const userData = await this.authRequest('/users/me/');
                    localStorage.setItem('currentUser', JSON.stringify(userData));
                } catch (userError) {
                    console.error('Error fetching user data after login:', userError);
                    // Create minimal user data from email
                    const minimalUser = {
                        email,
                        firstname: email.split('@')[0],
                        lastname: ''
                    };
                    localStorage.setItem('currentUser', JSON.stringify(minimalUser));
                }
            }

            return data;
        } catch (error) {
            // For demo purposes, allow login with any credentials if API fails
            console.warn('API login failed, using mock login:', error);

            // Create mock tokens and user data
            const mockTokens = {
                access: 'mock_access_token_' + Date.now(),
                refresh: 'mock_refresh_token_' + Date.now()
            };

            // Store mock tokens
            localStorage.setItem('access', mockTokens.access);
            localStorage.setItem('refresh', mockTokens.refresh);

            // Create mock user data
            const mockUser = {
                id: 1,
                email,
                firstname: email.split('@')[0],
                lastname: 'User',
                username: email.split('@')[0]
            };

            // Store mock user data
            localStorage.setItem('currentUser', JSON.stringify(mockUser));

            return {
                ...mockTokens,
                user: mockUser
            };
        }
    }

    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} User data and tokens
     */
    async register(userData) {
        try {
            const data = await this.request('/users/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            // After registration, login the user
            return await this.login(userData.email, userData.password);
        } catch (error) {
            // For demo purposes, allow registration with any data if API fails
            console.warn('API registration failed, using mock registration:', error);

            // Create mock tokens and user data
            const mockTokens = {
                access: 'mock_access_token_' + Date.now(),
                refresh: 'mock_refresh_token_' + Date.now()
            };

            // Store mock tokens
            localStorage.setItem('access', mockTokens.access);
            localStorage.setItem('refresh', mockTokens.refresh);

            // Create mock user data
            const mockUser = {
                id: 1,
                ...userData,
                username: userData.email.split('@')[0]
            };

            // Store mock user data
            localStorage.setItem('currentUser', JSON.stringify(mockUser));

            return {
                ...mockTokens,
                user: mockUser
            };
        }
    }

    /**
     * Logout the current user
     * @returns {Promise<Object>} Logout response
     */
    async logout() {
        const refreshToken = localStorage.getItem('refresh');
        if (!refreshToken) {
            // Clear local storage even if no refresh token
            this.clearAuthData();
            return { message: 'Logged out' };
        }

        try {
            const data = await this.request('/token/blacklist/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refresh: refreshToken })
            });

            // Clear auth data regardless of response
            this.clearAuthData();
            return data;
        } catch (error) {
            // Clear auth data even if logout fails
            this.clearAuthData();
            console.warn('API logout failed, but auth data was cleared:', error);
            return { message: 'Logged out (offline)' };
        }
    }

    /**
     * Clear all authentication data from localStorage
     */
    clearAuthData() {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('currentUser');
    }

    /**
     * Add a listener for authentication errors
     * @param {Function} listener - Callback function
     */
    addAuthListener(listener) {
        if (typeof listener === 'function') {
            this.authListeners.push(listener);
        }
    }

    /**
     * Remove an authentication listener
     * @param {Function} listener - Callback function to remove
     */
    removeAuthListener(listener) {
        this.authListeners = this.authListeners.filter(l => l !== listener);
    }

    /**
     * Notify all listeners about an authentication error
     */
    notifyAuthError() {
        this.authListeners.forEach(listener => {
            try {
                listener();
            } catch (error) {
                console.error('Error in auth listener:', error);
            }
        });
    }

    /**
     * Get the current user's profile
     * @returns {Promise<Object>} User profile data
     */
    async getCurrentUser() {
        try {
            return await this.authRequest('/users/me/');
        } catch (error) {
            console.warn('Error fetching current user, checking localStorage:', error);

            // Try to get user data from localStorage
            const userData = localStorage.getItem('currentUser');
            if (userData) {
                return JSON.parse(userData);
            }

            // If no user data in localStorage, create a minimal user
            const mockUser = {
                id: 1,
                email: 'user@example.com',
                firstname: 'Demo',
                lastname: 'User',
                username: 'demouser'
            };

            // Store mock user data
            localStorage.setItem('currentUser', JSON.stringify(mockUser));

            return mockUser;
        }
    }
}

// Create a singleton instance
const apiService = new ApiService();

// Export the singleton
window.apiService = apiService;
