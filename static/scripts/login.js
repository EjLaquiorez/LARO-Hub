document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("access");
    if (token && isTokenValid(token)) {
        window.location.replace("dashboard.html");
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

function handleLoginSubmit(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!isValidEmail(email)) {
        displayError("Invalid email format.", "login-form");
        return;
    }

    if (!password) {
        displayError("Password cannot be empty.", "login-form");
        return;
    }

    fetch("/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    })
        .then(response => {
            if (!response.ok) {
                displayError("Invalid credentials.", "login-form");
                throw new Error("Login failed");
            }
            return response.json();
        })
        .then(data => {
            if (data.tokens && data.user) {
                localStorage.setItem("access", data.tokens.access);
                localStorage.setItem("refresh", data.tokens.refresh);
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("currentUser", JSON.stringify(data.user));
                if (data.id) {
                    localStorage.setItem("id", JSON.stringify(data.id));
                }
                window.location.href = "/dashboard.html";
            }
        })
        .catch(console.error);
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

function isTokenValid(token) {
    const payload = parseJwt(token);
    const now = Math.floor(Date.now() / 1000);
    return payload && payload.exp > now;
}

function parseJwt(token) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(atob(base64).split("").map(c =>
            "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(""));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}
