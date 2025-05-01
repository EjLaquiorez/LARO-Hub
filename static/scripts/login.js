document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const googleLoginButton = document.querySelector(".google-login");
    const signupLink = document.querySelector(".signup-text a");

    // Redirect if token exists and is valid
    const token = localStorage.getItem("access");
    if (token && isTokenValid(token)) {
        window.location.replace("index.html");
    }

    // Handle login form submission
    loginForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent default form submission

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const errorMsg = document.createElement("p");
        errorMsg.style.color = "red";

        // Validate email and password
        if (!isValidEmail(email)) {
            displayError("Invalid email format.", loginForm);
            return;
        }

        if (!password) {
            displayError("Password cannot be empty.", loginForm);
            return;
        }

        // Simulate login process (replace with actual API call)
        fetch("http://127.0.0.1:8000/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        })
            .then((response) => {
                if (!response.ok) {
                    if (response.status === 400) {
                        displayError("Invalid credentials.", loginForm);
                    } else {
                        displayError(`Error code: ${response.status}`, loginForm);
                    }
                    throw new Error("Login failed");
                }
                return response.json();
            })
            .then((data) => {
                console.log("Login successful:", data);
                if (data.tokens && data.user) {
                    localStorage.setItem("access", data.tokens.access);
                    localStorage.setItem("refresh", data.tokens.refresh);
                    localStorage.setItem("user", JSON.stringify(data.user));
                    window.location.href = "index.html";
                }
            })
            .catch((error) => console.error(error));
    });

    // Handle Google login button click
    googleLoginButton.addEventListener("click", () => {
        // Simulate Google login process (replace with actual Google OAuth logic)
        console.log("Google login clicked");
        alert("Redirecting to Google login...");
    });

    // Handle signup link click
    signupLink.addEventListener("click", (event) => {
        event.preventDefault();
        switchToRegisterForm();
    });

    // Utility function to validate email format
    function isValidEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    // Utility function to display error messages
    function displayError(message, form) {
        const errorMsg = document.getElementById("error-msg") || document.createElement("p");
        errorMsg.id = "error-msg";
        errorMsg.style.color = "red";
        errorMsg.textContent = message;
        form.prepend(errorMsg);
    }

    // Switch to registration form
    function switchToRegisterForm() {
        const container = document.querySelector(".form-container");
        container.innerHTML = `
            <h1>REGISTER</h1>
            <form id="register-form">
                <input type="text" id="firstname" name="firstname" placeholder="First Name" required>
                <input type="text" id="lastname" name="lastname" placeholder="Last Name" required>
                <input type="email" id="email" name="email" placeholder="Email" required>
                <input type="password" id="password" name="password" placeholder="Password" required>
                <input type="password" id="confirm-password" name="confirm-password" placeholder="Confirm Password" required>
                <button type="submit">REGISTER</button>
                <p class="signup-text">Already have an account? <a href="#">Log-In</a></p>
            </form>
        `;

        const registerForm = document.getElementById("register-form");
        const loginLink = document.querySelector(".signup-text a");

        // Handle registration form submission
        registerForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const firstname = document.getElementById("firstname").value.trim();
            const lastname = document.getElementById("lastname").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const confirmPassword = document.getElementById("confirm-password").value.trim();

            const errors = [];

            if (!isValidEmail(email)) {
                errors.push("Invalid email format.");
            }

            if (password !== confirmPassword) {
                errors.push("Passwords do not match.");
            }

            if (password.length < 8) {
                errors.push("Password must be at least 8 characters long.");
            }

            if (errors.length > 0) {
                displayError(errors.join(" "), registerForm);
                return;
            }

            // Simulate registration process (replace with actual API call)
            fetch("http://127.0.0.1:8000/register/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ firstname, lastname, email, password }),
            })
                .then((response) => {
                    if (!response.ok) {
                        displayError("Registration failed. Email may already be in use.", registerForm);
                        throw new Error("Registration failed");
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log("Registration successful:", data);
                    alert("Account created successfully! Redirecting to login...");
                    switchToLoginForm();
                })
                .catch((error) => console.error(error));
        });

        // Handle login link click
        loginLink.addEventListener("click", (event) => {
            event.preventDefault();
            switchToLoginForm();
        });
    }

    // Switch back to login form
    function switchToLoginForm() {
        const container = document.querySelector(".form-container");
        container.innerHTML = `
            <h1>WELCOME!</h1>
            <form id="login-form">
                <input type="email" id="email" name="email" placeholder="EMAIL" required>
                <input type="password" id="password" name="password" placeholder="PASSWORD" required>
                <p class="forgot-password"><a href="#">forgot password?</a></p>
                <p class="or-text"> ━━━━━━━or━━━━━━━</p>
                <button type="button" class="google-login">
                    Login with Google
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" style="vertical-align: middle; margin-left: 8px;">
                        <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.17 3.22l6.85-6.85C34.6 2.7 29.6 0 24 0 14.8 0 6.9 5.4 3.3 13.3l7.98 6.2C13.7 14.1 18.3 9.5 24 9.5z"/>
                        <path fill="#34A853" d="M46.5 24c0-1.6-.15-3.1-.43-4.6H24v9h12.7c-.55 3-2.2 5.5-4.7 7.2l7.2 5.6c4.2-3.9 6.6-9.6 6.6-16.2z"/>
                        <path fill="#FBBC05" d="M10.3 28.5c-.5-1.5-.8-3.1-.8-4.7s.3-3.2.8-4.7l-7.98-6.2C.8 18.3 0 21 0 24s.8 5.7 2.3 8.9l7.98-6.2z"/>
                        <path fill="#EA4335" d="M24 48c6.5 0 12-2.1 16-5.7l-7.2-5.6c-2 1.3-4.5 2-7 2-5.7 0-10.3-4.6-10.3-10.3 0-1.7.5-3.3 1.3-4.7l-7.98-6.2C6.9 33.6 14.8 39 24 39z"/>
                    </svg>
                </button>
                <button type="submit">LOG-IN</button>
                <p class="signup-text">Don't have an Account? <a href="#">Sign-Up</a></p>
            </form>
        `;

        const loginForm = document.getElementById("login-form");
        const signupLink = document.querySelector(".signup-text a");

        // Reattach event listeners
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();
            // Handle login logic here
        });

        signupLink.addEventListener("click", (event) => {
            event.preventDefault();
            switchToRegisterForm();
        });
    }

    // Utility function to check token validity
    function isTokenValid(token) {
        const payload = parseJwt(token);
        if (!payload) return false;
        const now = Math.floor(Date.now() / 1000);
        return payload.exp > now;
    }

    // Utility function to parse JWT
    function parseJwt(token) {
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join("")
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    }
});

