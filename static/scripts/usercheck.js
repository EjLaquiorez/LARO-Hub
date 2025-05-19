function parseJwt(token) {
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
      return null;
    }
}

function isTokenValid(token) {
    const payload = parseJwt(token);
    if (!payload) return false;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
}

function getLoggedInUser() {
    const user = localStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
}

function refreshAccessToken() {
    return new Promise((resolve, reject) => {
        const refreshToken = localStorage.getItem("refresh");

        if (!refreshToken) {
            console.error("No refresh token found");
            // Clear any remaining auth data to ensure consistent state
            window.apiService.clearAuthData();
            reject(new Error("No refresh token found"));
            return;
        }

        fetch("/api/token/refresh/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh: refreshToken })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.access) {
                localStorage.setItem("access", data.access);
                console.log("Token refreshed successfully");
                resolve(data.access);
            } else {
                throw new Error("No access token in response");
            }
        })
        .catch(error => {
            console.error('Error refreshing token:', error);
            // Clear invalid tokens on failure
            window.apiService.clearAuthData();
            reject(error);
        });
    });
}

async function requireAuth() {
    console.log("Checking authentication status...");
    const token = localStorage.getItem("access");
    const user = getLoggedInUser();

    // Check if we have both token and user data
    if (!token || !user) {
        console.error("Missing authentication data");
        clearAuthData();
        return false;
    }

    // Check if token is still valid
    if (isTokenValid(token)) {
        console.log("Token is valid");
        return true;
    }

    console.log("Token expired, attempting to refresh...");
    try {
        const newToken = await refreshAccessToken();
        console.log("Token refreshed successfully");

        // Verify the user data is still valid by fetching current user
        try {
            await validateUserData();
            return true;
        } catch (userError) {
            console.error("User validation failed:", userError);
            clearAuthData();
            return false;
        }
    } catch (error) {
        console.error("Authentication failed during token refresh:", error);
        clearAuthData();
        return false;
    }
}

// Helper function to clear all auth data
function clearAuthData() {
    window.apiService.clearAuthData();
}

// Validate user data by fetching current user profile
async function validateUserData() {
    try {
        const userData = await window.apiService.getCurrentUser();
        // Update stored user data with latest from server
        localStorage.setItem("currentUser", JSON.stringify(userData));
        return userData;
    } catch (error) {
        console.error("Failed to validate user:", error);
        throw error;
    }
}

// Get the current page name
const currentPage = window.location.pathname.split('/').pop();

// List of public pages that don't require authentication
const publicPages = ['login.html', 'signup.html', 'index.html', ''];

// Handle authentication for all protected pages
if (!publicPages.includes(currentPage)) {
    console.log("Current page requires authentication:", currentPage);

    // Check authentication on page load
    document.addEventListener('DOMContentLoaded', async () => {
        // Create auth status element for user feedback
        const authStatusContainer = document.createElement('div');
        authStatusContainer.id = 'auth-status-container';
        authStatusContainer.style.display = 'none';
        authStatusContainer.style.position = 'fixed';
        authStatusContainer.style.top = '70px';
        authStatusContainer.style.right = '20px';
        authStatusContainer.style.padding = '10px 15px';
        authStatusContainer.style.borderRadius = '5px';
        authStatusContainer.style.zIndex = '9999';
        authStatusContainer.style.transition = 'opacity 0.3s ease';
        document.body.appendChild(authStatusContainer);

        // Show auth status message
        function showAuthStatus(message, isError = false) {
            authStatusContainer.textContent = message;
            authStatusContainer.style.backgroundColor = isError ? '#f44336' : '#4CAF50';
            authStatusContainer.style.color = 'white';
            authStatusContainer.style.display = 'block';
            authStatusContainer.style.opacity = '1';

            // Hide after 5 seconds
            setTimeout(() => {
                authStatusContainer.style.opacity = '0';
                setTimeout(() => {
                    authStatusContainer.style.display = 'none';
                }, 300);
            }, 5000);
        }

        try {
            console.log("Checking authentication for protected page...");
            // Show loading indicator
            const mainContent = document.querySelector('main') || document.body;
            mainContent.classList.add('auth-checking');

            const isAuthenticated = await requireAuth();
            console.log("Authentication check result:", isAuthenticated);

            // Remove loading indicator
            mainContent.classList.remove('auth-checking');

            if (!isAuthenticated) {
                console.log("Not authenticated, redirecting to login...");
                showAuthStatus('Your session has expired. Redirecting to login...', true);

                // Short delay before redirect to show the message
                setTimeout(() => {
                    window.location.href = "/login.html?redirect=" + encodeURIComponent(window.location.pathname);
                }, 2000);
            } else {
                // User is authenticated, show welcome message
                const user = getLoggedInUser();
                if (user) {
                    showAuthStatus(`Welcome back, ${user.firstname}!`);
                }
            }
        } catch (error) {
            console.error("Authentication check failed:", error);

            // Remove loading indicator
            const mainContent = document.querySelector('main') || document.body;
            mainContent.classList.remove('auth-checking');

            // Show error message
            const errorMsg = document.createElement('div');
            errorMsg.className = 'auth-error-message';
            errorMsg.innerHTML = `
                <p>Authentication error. Please try logging in again.</p>
                <button id="auth-retry-btn">Retry</button>
                <button id="auth-login-btn">Go to Login</button>
            `;
            mainContent.prepend(errorMsg);

            // Add event listeners to buttons
            document.getElementById('auth-retry-btn').addEventListener('click', () => {
                window.location.reload();
            });

            document.getElementById('auth-login-btn').addEventListener('click', () => {
                window.location.href = "/login.html?redirect=" + encodeURIComponent(window.location.pathname);
            });
        }
    });
}
