// Import auth service
import authService from './auth-service.js';

document.addEventListener("DOMContentLoaded", () => {
    // Check if user is already authenticated
    if (authService.isAuthenticated()) {
        window.location.replace("/dashboard/");
    }

    attachLoginFormEvents();
    attachPasswordToggleEvents(); // Attach password toggle events
});

function attachPasswordToggleEvents() {
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm-password");
    const togglePasswordIcon = document.getElementById("toggle-password");
    const toggleConfirmPasswordIcon = document.getElementById("toggle-confirm-password");

    // Toggle main password visibility
    if (togglePasswordIcon && passwordInput) {
        togglePasswordIcon.addEventListener("click", () => {
            const isHidden = passwordInput.type === "password";
            passwordInput.type = isHidden ? "text" : "password";
            togglePasswordIcon.className = isHidden ? "fas fa-eye-slash" : "fas fa-eye"; // Change icon
        });
    }

    // Toggle confirm password visibility
    if (toggleConfirmPasswordIcon && confirmPasswordInput) {
        toggleConfirmPasswordIcon.addEventListener("click", () => {
            const isHidden = confirmPasswordInput.type === "password";
            confirmPasswordInput.type = isHidden ? "text" : "password";
            toggleConfirmPasswordIcon.className = isHidden ? "fas fa-eye-slash" : "fas fa-eye"; // Change icon
        });
    }
}

function attachLoginFormEvents() {
    const loginForm = document.getElementById("login-form");
    const googleLoginButton = document.querySelector(".google-login");
    const signupLink = document.querySelector(".signup-text a");

    loginForm.addEventListener("submit", handleLoginSubmit);

    googleLoginButton?.addEventListener("click", () => {
        console.log("Google login clicked");
        alert("Redirecting to Google login...");
    });

    signupLink?.addEventListener("click", (event) => {
        // Instead of showing inline form, redirect to the dedicated signup page
        window.location.href = "/signup/";
    });
}

async function handleLoginSubmit(event) {
    event.preventDefault();

    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Logging in...';
    submitButton.disabled = true;

    // Get error message container
    const errorMessage = document.getElementById("error-message");

    // Hide error message if it was previously shown
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }

    try {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        // Validate inputs
        if (!isValidEmail(email)) {
            if (errorMessage) {
                errorMessage.textContent = "Invalid email format.";
                errorMessage.style.display = 'block';
            } else {
                alert("Invalid email format.");
            }
            return;
        }

        if (!password) {
            if (errorMessage) {
                errorMessage.textContent = "Password cannot be empty.";
                errorMessage.style.display = 'block';
            } else {
                alert("Password cannot be empty.");
            }
            return;
        }

        // Attempt login using auth service
        await authService.login(email, password);

        // Redirect to dashboard on success
        window.location.href = "/dashboard/";
    } catch (error) {
        // Display error message
        console.error("Login error:", error);

        if (errorMessage) {
            errorMessage.textContent = error.message || "Login failed. Please check your credentials.";
            errorMessage.style.display = 'block';
        } else {
            alert(error.message || "Login failed. Please check your credentials.");
        }
    } finally {
        // Restore button state
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    }
}

// These functions have been removed as we now redirect to signup.html
// instead of showing an inline registration form


function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

// Token validation is now handled by the auth service
