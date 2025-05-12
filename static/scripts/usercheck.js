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
        .then(response => response.json())
        .then(data => {
            if (data.access) {
                localStorage.setItem("access", data.access);
                resolve(data.access);
            } else {
                reject(new Error("Failed to refresh token"));
            }
        })
        .catch(error => {
            console.error('Error refreshing token:', error);
            reject(error);
        });
    });
}

async function requireAuth() {
    console.log("Checking authentication status...");
    const token = localStorage.getItem("access");

    if (!token) {
        console.error("No access token found in localStorage");
        // Don't redirect automatically - let the calling code decide
        return false;
    }

    if (isTokenValid(token)) {
        console.log("Token is valid");
        return true;
    }

    console.log("Token expired, attempting to refresh...");
    try {
        const newToken = await refreshAccessToken();
        console.log("Token refreshed successfully");
        return true;
    } catch (error) {
        console.error("Authentication failed during token refresh:", error);
        // Don't redirect automatically - let the calling code decide
        return false;
    }
}

// Get the current page name
const currentPage = window.location.pathname.split('/').pop();

// Handle authentication for all protected pages including profile.html
// Don't redirect on login.html, signup.html, index.html, or empty path
if (currentPage !== 'login.html' &&
    currentPage !== 'signup.html' &&
    currentPage !== 'index.html' &&
    currentPage !== '') {

    console.log("Current page requires authentication:", currentPage);

    // Check authentication on page load
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            console.log("Checking authentication for protected page...");
            const isAuthenticated = await requireAuth();
            console.log("Authentication check result:", isAuthenticated);

            if (!isAuthenticated) {
                console.log("Not authenticated, redirecting to login...");
                window.location.href = "/login.html";
            }
        } catch (error) {
            console.error("Authentication check failed:", error);
            // Show error message instead of redirecting
            const mainContent = document.querySelector('main') || document.body;
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'Authentication error. Please try logging in again.';
            mainContent.prepend(errorMsg);
        }
    });
}
