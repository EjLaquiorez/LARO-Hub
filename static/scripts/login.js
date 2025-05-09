document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("access");
    if (token && isTokenValid(token)) {
        window.location.replace("index.html");
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
        event.preventDefault();
        switchToRegisterForm();
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

    fetch("http://127.0.0.1:8000/login/", {
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
                    localStorage.setItem("id", JSON.stringify(data.id));
                window.location.href = "index.html";
            }
        })
        .catch(console.error);
}

function switchToRegisterForm() {
    const container = document.querySelector(".form-container");
    container.innerHTML = `
        <h1>REGISTER</h1>
        <form id="register-form">
            <input type="text" id="firstname" name="firstname" placeholder="FIRST NAME" required />
            <input type="text" id="lastname" name="lastname" placeholder="LAST NAME" required />
            <input type="email" id="email" name="email" placeholder="EMAIL" required />
            <div class="password-container">
                <input type="password" id="password" name="password" placeholder="PASSWORD" required />
                <i id="toggle-password" class="fas fa-eye"></i>
            </div>
            <div class="password-container">
                <input type="password" id="confirm-password" name="confirm-password" placeholder="CONFIRM PASSWORD" required />
                <i id="toggle-confirm-password" class="fas fa-eye"></i>
            </div>
            <button type="submit">REGISTER</button>
            <p class="signup-text">Already have an Account? <a href="#">Log-In</a></p>
        </form>
    `;

    const registerForm = document.getElementById("register-form");
    const loginLink = document.querySelector(".signup-text a");

    registerForm.addEventListener("submit", handleRegisterSubmit);
    loginLink.addEventListener("click", (e) => {
        e.preventDefault();
        switchToLoginForm();
    });

    attachPasswordToggleEvents(); // Attach toggle events for password visibility
}

function handleRegisterSubmit(event) {
    event.preventDefault();

    const firstname = document.getElementById("firstname").value.trim();
    const lastname = document.getElementById("lastname").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();

    const errors = [];

    if (!isValidEmail(email)) errors.push("Invalid email format.");
    if (password !== confirmPassword) errors.push("Passwords do not match.");
    if (password.length < 8) errors.push("Password must be at least 8 characters long.");

    if (errors.length > 0) {
        displayError(errors.join(" "), "register-form");
        return;
    }

    fetch("http://127.0.0.1:8000/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstname, lastname, email, password }),
    })
        .then((response) => {
            if (!response.ok) {
                displayError("Registration failed. Email may already be in use.", "register-form");
                throw new Error("Registration failed");
            }
            return response.json();
        })
        .then(() => {
            alert("Account created successfully! Redirecting to login...");
            switchToLoginForm();
        })
        .catch(console.error);
}

function switchToLoginForm() {
    const container = document.querySelector(".form-container");
    container.innerHTML = `
            <h1>WELCOME!</h1>
            <form id="login-form">
                <input type="email" id="email" name="email" placeholder="EMAIL" required />
                <div class="password-container">
                    <input type="password" id="password" name="password" placeholder="PASSWORD" required />
                    <i id="toggle-password" class="fas fa-eye"></i>
                </div>
                <p class="forgot-password"><a href="#">forgot password?</a></p>
                <p class="or-text"> ━━━━━━━or━━━━━━━</p>
                <button type="button" class="google-login">Login with Google</button>
                <button type="submit">LOG-IN</button>
                <p class="signup-text">Don't have an Account? <a href="#">Sign-Up</a></p>
            </form>
    `;

    attachLoginFormEvents(); // Reattach login logic after rendering
    attachPasswordToggleEvents(); 
}

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
