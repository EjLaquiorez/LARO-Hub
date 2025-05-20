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
        window.location.href = "/signup.html";
    });
}

async function handleLoginSubmit(event) {
    event.preventDefault();

    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Logging in...';
    submitButton.disabled = true;

    try {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        // Validate inputs
        if (!isValidEmail(email)) {
            displayError("Invalid email format.", "login-form");
            return;
        }

        if (!password) {
            displayError("Password cannot be empty.", "login-form");
            return;
        }

        // Clear any previous error
        const errorMsg = document.getElementById("error-msg");
        if (errorMsg) {
            errorMsg.textContent = '';
        }

        // Attempt login using auth service
        await authService.login(email, password);

        // Redirect to dashboard on success
        window.location.href = "/dashboard/";
    } catch (error) {
        // Display error message
        displayError(error.message || "Login failed. Please check your credentials.", "login-form");
        console.error("Login error:", error);
    } finally {
        // Restore button state
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    }
}

// These functions have been removed as we now redirect to signup.html
// instead of showing an inline registration form

function togglePasswordVisibility() {
    const passwordInput = document.getElementById("password");
    const toggleIcon = document.getElementById("toggle-icon");

    if (passwordInput) {
        const isHidden = passwordInput.type === "password";
        passwordInput.type = isHidden ? "text" : "password";
        toggleIcon.className = isHidden ? "fas fa-eye-slash" : "fas fa-eye";  // Change icon
    }
}


function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function displayError(message, formId) {
    const form = document.getElementById(formId);
    let errorMsg = document.getElementById("error-msg");

    if (!errorMsg) {
        errorMsg = document.createElement("p");
        errorMsg.id = "error-msg";
        errorMsg.style.color = "red";
        form.prepend(errorMsg);
    }

    errorMsg.textContent = message;
}

// Token validation is now handled by the auth service
