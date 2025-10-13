document.addEventListener("DOMContentLoaded", () => {
    // This part is fine, no changes needed here.
    const token = localStorage.getItem("access");
    if (token && isTokenValid(token)) {
        window.location.replace("/dashboard/");
    }

    attachLoginFormEvents();
    attachPasswordToggleEvents();
});


function attachLoginFormEvents() {
    const loginForm = document.getElementById("login-form");
    if (!loginForm) return;

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        displayError("", "login-form", true);

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!isValidEmail(email)) {
            displayError("Please enter a valid email address.", "login-form");
            return;
        }

        if (!password) {
            displayError("Please enter your password.", "login-form");
            return;
        }

        // --- FIX: Get the CSRF token from the browser's cookies ---
        const csrfToken = getCookie('csrftoken');

        try {
            // --- FIX: Use the correct API endpoint ---
            const response = await fetch("/api/login/", { 
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken,
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                let errorMessage = "An unexpected error occurred. Please try again.";
                try {
                    const data = await response.json();
                    // Use the specific error message from the API if it exists
                    errorMessage = data.error || data.detail || "Invalid credentials provided.";
                } catch (e) {
                    // This catches network errors or if the server response isn't JSON
                    errorMessage = `Server error (Status ${response.status}). Please try again later.`;
                }
                displayError(errorMessage, "login-form");
                throw new Error(errorMessage); // Stop the function from proceeding
            }
            
            // --- Successful Login ---
            const data = await response.json();
            
            if (data.access && data.refresh) {
                localStorage.setItem("access", data.access);
                localStorage.setItem("refresh", data.refresh);
                window.location.replace("/dashboard/");
            } else {
                displayError("Login successful, but no authentication tokens were received.", "login-form");
            }

        } catch (error) {
            console.error("Login request failed:", error.message);
            // The error is already displayed on the page by the logic above.
        }
    });
}

// --- NEW HELPER FUNCTION: To read a cookie by name ---
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


// --- Utility and Helper Functions (No changes needed below) ---
function attachPasswordToggleEvents() {
    const passwordInput = document.getElementById("password");
    const togglePasswordIcon = document.getElementById("toggle-password");

    if (togglePasswordIcon && passwordInput) {
        togglePasswordIcon.addEventListener("click", () => {
            const isHidden = passwordInput.type === "password";
            passwordInput.type = isHidden ? "text" : "password";
            togglePasswordIcon.className = isHidden ? "fas fa-eye-slash" : "fas fa-eye";
        });
    }
}


function isTokenValid(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const now = Math.floor(Date.now() / 1000);
        return payload && payload.exp > now;
    } catch (e) {
        return false;
    }
}

function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function displayError(message, formId, clear = false) {
    const form = document.getElementById(formId);
    let errorContainer = form.querySelector(".error-message-container");

    if (!errorContainer) {
        errorContainer = document.createElement("div");
        errorContainer.className = "error-message-container";
        errorContainer.style.color = "#AD2831";
        errorContainer.style.marginBottom = "15px";
        errorContainer.style.textAlign = "center";
        errorContainer.style.fontWeight = "bold";
        form.insertBefore(errorContainer, form.children[1]);
    }

    errorContainer.textContent = message;
    errorContainer.style.display = (clear || !message) ? "none" : "block";
}

