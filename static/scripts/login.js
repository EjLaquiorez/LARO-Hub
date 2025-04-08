document.addEventListener("DOMContentLoaded", (e) => {
    e.preventDefault()

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
            formContainer.innerHTML = `<form id="login-form" action="">
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
            <a href=""><img src="img/facebook.png" alt=""></a>
            <a href=""><img src="img/google.png" alt=""></a>
            <a href=""><img src="img/discord.png" alt=""></a>
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
            formContainer.innerHTML = `<form id="register-form" action="">
                <input type="text" name="fullname" id="fullname" placeholder="Full Name" required>

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
                <a href=""><img src="img/facebook.png" alt=""></a>
                <a href=""><img src="img/google.png" alt=""></a>
                <a href=""><img src="img/discord.png" alt=""></a>
                
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
})

