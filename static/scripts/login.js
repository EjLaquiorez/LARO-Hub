document.addEventListener("DOMContentLoaded", (e) => {

    const token = localStorage.getItem("access");
    if (token && isTokenValid(token)) {
        window.location.replace("/");
    }

    let showPasswordBtn = document.getElementById("show-password-btn")
    let switchButton = document.getElementById("switch-form")

    switchButton.onclick = () => {
        switchForm(1)
    }

    showPasswordBtn.onclick = () => {
        if (showPasswordBtn.textContent == "Show Password") {
            showPasswordBtn.textContent = "Hide Password"
            showPassword(0)
        }

        else {
            showPasswordBtn.textContent = "Show Password"
            hidePassword(0)
        }
        
    }

    function switchForm(value) {
        let formContainer = document.getElementById("container")
        if (value == 0) {
            formContainer.innerHTML = `
            <div id="error-msg"></div>
            <form id="login-form" action="">
            <input type="email" name="email" id="email" placeholder="Email" required>
            <input type="password" name="password" id="password" placeholder="Password" required>
            <div id="show-password-container">
                <button type="button" id="show-password-btn">Show Password</button>
            </div>
            <button type="submit">LOGIN</button>
        </form>
        <a href="" id="forgot-password">forgot password?</a>
        <div>Log-in via: </div>
        <div id="external-icons">
            <a href=""><img src="../static/img/facebook.png" alt=""></a>
            <a href=""><img src="../static/img/google.png" alt=""></a>
            <a href=""><img src="../static/img/discord.png" alt=""></a>
        </div>`

            switchButton.onclick = () => {
                switchForm(1)
            }

            showPasswordBtn = document.getElementById("show-password-btn")

            showPasswordBtn.onclick = () => {
                if (showPasswordBtn.textContent == "Show Password") {
                    showPasswordBtn.textContent = "Hide Password"
                    showPassword(0)
                }
        
                else {
                    showPasswordBtn.textContent = "Show Password"
                    hidePassword(0)
                }
                
            }

            switchButton.textContent = `Register Here`
        }

        else {
            formContainer.innerHTML = `
                <div id="error-msg"></div>
                <form id="register-form" action="{% url 'api:register' %}" method="POST">
                    <input type="text" name="firstname" id="firstname" placeholder="First Name" required>
                    <input type="text" name="middlename" id="middlename" placeholder="Middle Name">
                    <input type="text" name="lastname" id="lastname" placeholder="Last Name" required>
                    <input type="email" name="email" id="email" placeholder="Email" required>
                    <input type="password" name="password" id="password" placeholder="Password" required>
                    <input type="password" name="confirm-password" id="confirm-password" placeholder="Confirm Password" required>
                    <div id="show-password-container">
                        <button type="button" id="show-password-btn">Show Password</button>
                    </div>
                    <button type="submit">REGISTER</button>
                </form>
                <div>Register via: </div>
                <div id="external-icons">
                    <a href=""><img src="../static/img/facebook.png" alt=""></a>
                    <a href=""><img src="../static/img/google.png" alt=""></a>
                    <a href=""><img src="../static/img/discord.png" alt=""></a>
                </div>`

            switchButton.onclick = () => {
                switchForm(0)
            }

            showPasswordBtn = document.getElementById("show-password-btn")

            showPasswordBtn.onclick = () => {
                if (showPasswordBtn.textContent == "Show Password") {
                    showPasswordBtn.textContent = "Hide Password"
                    showPassword(1)
                }
        
                else {
                    showPasswordBtn.textContent = "Show Password"
                    hidePassword(1)
                }
                
            }

            switchButton.textContent = `Already have an account?`

            document.getElementById("register-form").addEventListener("submit", (e) => {
                e.preventDefault()
            
                const firstName = document.getElementById("firstname").value.toLowerCase()
                const middleName = document.getElementById("middlename").value.toLowerCase()
                const lastname = document.getElementById("lastname").value.toLowerCase()
                const email = document.getElementById("email").value
                const password = document.getElementById("password").value
                const confirmPassword = document.getElementById("confirm-password").value
                const errorMsg = document.getElementById("error-msg")
                const errors = []
            
                const fullName = (firstName + middleName + lastname).replace(/\s+/g, "")
                const restrictedPatterns = ["12345", "qwerty", "password"] 
            
                function isValidEmail(email) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                }
            
                function isPalindrome(str) {
                    return str === str.split("").reverse().join("")
                }
            
                function hasConsecutiveChars(str, limit) {
                    let count = 1
                    for (let i = 1; i < str.length; i++) {
                        if (str[i] === str[i - 1]) {
                            count++
                            if (count > limit) return true
                        } else {
                            count = 1
                        }
                    }
                    return false
                }
            
                function hasFiveConsecutiveFromName(pw, name) {
                    for (let i = 0; i <= name.length - 5; i++) {
                        const sequence = name.substring(i, i + 5)
                        if (pw.toLowerCase().includes(sequence)) return true
                    }
                    return false
                }
            
                const specialCharCount = (password.match(/[^A-Za-z0-9]/g) || []).length
            
                if (!isValidEmail(email)) {
                    errors.push("Invalid email format")
                }
            
                if (confirmPassword !== password) {
                    errors.push("Passwords do not match")
                }
            
                if (password.length < 15) {
                    errors.push("Password should have at least 15 characters")
                }
            
                if (specialCharCount < 2) {
                    errors.push("Password must include at least 2 special characters")
                }
            
                if (!/^[A-Za-z]/.test(password)) {
                    errors.push("Password must start with a letter")
                }
            
                if (!/[A-Z]/.test(password)) {
                    errors.push("Password must contain at least 1 uppercase letter")
                }
            
                if (!/[a-z]/.test(password)) {
                    errors.push("Password must contain at least 1 lowercase letter")
                }
            
                if (!/[0-9]/.test(password)) {
                    errors.push("Password must contain at least 1 number")
                }
            
                if (isPalindrome(password)) {
                    errors.push("Password must not be a palindrome")
                }
            
                if (hasConsecutiveChars(password, 2)) {
                    errors.push("Password must not contain any character more than 2 times consecutively")
                }
            
                if (hasFiveConsecutiveFromName(password, fullName)) {
                    errors.push("Password must not have 5 consecutive characters from your name")
                }
            
                for (const pattern of restrictedPatterns) {
                    if (password.toLowerCase().includes(pattern)) {
                        errors.push(`Password must not contain restricted pattern: ${pattern}`)
                    }
                }
            
                if (errors.length > 0) {
                    errorMsg.textContent = errors.join(", ")
                }
        
                else {
                    
                    console.log("Password is valid. Submitting form...")
                    fetch("api/register/", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                        },
        
                        body: JSON.stringify(
                            {
                                "firstname": firstName,
                                "lastname": lastname,
                                "middlename": middleName,
                                "email": email,
                                "password": password
                              }
                        )
                    })
                        .then(response => {
                            if (!response.ok) {
                                errorMsg.textContent = "Email already in use"
                                throw new Error("Unable to create new user")
                            }
        
                            return response.json()
                        })
                        .then(data => {
                            console.log("Successfully created an account: ", data);
                            errorMsg.style.color = "green";
                            errorMsg.textContent = "Account successfully created!";

                            setTimeout(() => {
                                window.location.href = "/login/";  // Use proper URL path
                            }, 2000);
                        })
                        .catch(error => console.error(error))
        
                }
            
                
            })
        }
    }

    function isTokenValid(token) {
        const payload = parseJwt(token);
        if (!payload) return false;
        const now = Math.floor(Date.now() / 1000);
        return payload.exp > now;
    }

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

    function showPassword(mode) {
        if (mode == 0) {
            let passwordInput = document.getElementById("password")
            passwordInput.type = "text"
        }

        else {
            let passwordInput = document.getElementById("password")
            let confirmPasswordInput = document.getElementById("confirm-password")

            passwordInput.type = "text"
            confirmPasswordInput.type = "text"
        }
    }

    function hidePassword(mode) {
        if (mode == 0) {
            let passwordInput = document.getElementById("password")
            passwordInput.type = "password"
        }

        else {
            let passwordInput = document.getElementById("password")
            let confirmPasswordInput = document.getElementById("confirm-password")

            passwordInput.type = "password"
            confirmPasswordInput.type = "password"
        }
    }

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        
        try {
            const response = await fetch('/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                },
                body: JSON.stringify({
                    email: formData.get('email'),
                    password: formData.get('password')
                })
            });
    
            const data = await response.json();
            
            if (response.ok) {
                // Store tokens
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);
                // Redirect to home page
                window.location.href = '/';  // Changed from /dashboard/ to /
            } else {
                document.getElementById('error-msg').textContent = data.detail || 'Login failed';
            }
        } catch (error) {
            document.getElementById('error-msg').textContent = 'An error occurred';
        }
    });
    

    function isValidEmail(email) {
        let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }
})

