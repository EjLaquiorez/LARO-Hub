/**
 * Authentication check script for LARO-Hub
 * This script is included in all pages that require authentication
 */

// Import auth service
import authService from './auth-service.js';

// Get the current path
const currentPath = window.location.pathname;

// Public paths that don't require authentication
const publicPaths = [
    '/login/', '/login.html',
    '/signup/', '/signup.html',
    '/index/', '/index.html',
    '/'
];

// Check if current path is a public path
const isPublicPath = publicPaths.some(path =>
    currentPath === path ||
    (path.endsWith('/') && currentPath === path.slice(0, -1)) ||
    (!path.endsWith('/') && currentPath === path + '/')
);

// If this is not a public path, check authentication
if (!isPublicPath) {
    console.log("Current page requires authentication:", currentPath);

    // Check authentication on page load
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            console.log("Checking authentication for protected page...");

            // Check if user is authenticated
            if (!authService.isAuthenticated()) {
                console.log("Access token is invalid or expired, attempting to refresh...");

                try {
                    // Try to refresh the token
                    await authService.refreshAccessToken();
                    console.log("Token refreshed successfully");
                } catch (refreshError) {
                    console.error("Token refresh failed:", refreshError);
                    console.log("Not authenticated, redirecting to login...");
                    window.location.href = "/login/";
                    return;
                }
            }

            // If we get here, the user is authenticated
            console.log("User is authenticated");

            // Fetch current user data if needed
            if (!authService.getCurrentUser()) {
                try {
                    const apiService = window.apiService;
                    if (apiService) {
                        const userData = await apiService.getCurrentUser();
                        // Store user data
                        localStorage.setItem('currentUser', JSON.stringify(userData));
                        // Update auth service user data
                        authService.user = userData;
                    }
                } catch (userError) {
                    console.error("Error fetching user data:", userError);
                }
            }
        } catch (error) {
            console.error("Authentication check failed:", error);

            // Show error message instead of redirecting
            const mainContent = document.querySelector('main') || document.body;
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'Authentication error. Please try logging in again.';
            errorMsg.style.color = 'red';
            errorMsg.style.padding = '10px';
            errorMsg.style.margin = '10px 0';
            errorMsg.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
            errorMsg.style.borderRadius = '5px';
            mainContent.prepend(errorMsg);

            // Add a login button
            const loginBtn = document.createElement('button');
            loginBtn.textContent = 'Go to Login';
            loginBtn.style.padding = '8px 16px';
            loginBtn.style.marginTop = '10px';
            loginBtn.style.cursor = 'pointer';
            loginBtn.addEventListener('click', () => {
                window.location.href = '/login/';
            });
            errorMsg.appendChild(loginBtn);
        }
    });
}
