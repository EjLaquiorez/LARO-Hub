document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const token = localStorage.getItem("access");
    if (token) {
        try {
            // Simple token validation (you might want to add more robust validation)
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Math.floor(Date.now() / 1000);

            if (payload && payload.exp > now) {
                // Token is valid, redirect to dashboard
                window.location.replace("/dashboard.html");
                return;
            }
        } catch (e) {
            // Invalid token format, continue with signup
            console.error("Invalid token format:", e);
        }
    }

    // Toggle password visibility
    const togglePassword = document.getElementById('toggle-password');
    const password = document.getElementById('password');

    if (togglePassword && password) {
        togglePassword.addEventListener('click', function() {
            const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
            password.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // Toggle confirm password visibility
    const toggleConfirmPassword = document.getElementById('toggle-confirm-password');
    const confirmPassword = document.getElementById('confirm-password');

    if (toggleConfirmPassword && confirmPassword) {
        toggleConfirmPassword.addEventListener('click', function() {
            const type = confirmPassword.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmPassword.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // Form submission
    const form = document.getElementById('signup-form');
    const errorMessage = document.getElementById('error-message');

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form values
            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            // Validate password length
            if (password.length < 8) {
                if (errorMessage) {
                    errorMessage.textContent = 'Password must be at least 8 characters long!';
                    errorMessage.style.display = 'block';
                } else {
                    alert('Password must be at least 8 characters long!');
                }
                return;
            }

            // Validate passwords match
            if (password !== confirmPassword) {
                if (errorMessage) {
                    errorMessage.textContent = 'Passwords do not match!';
                    errorMessage.style.display = 'block';
                } else {
                    alert('Passwords do not match!');
                }
                return;
            }

            // Split fullname into firstname and lastname
            const nameParts = fullname.split(' ').filter(part => part.trim() !== '');
            let firstname, lastname, middlename = '';

            // Validate that we have at least first and last name
            if (nameParts.length < 2) {
                if (errorMessage) {
                    errorMessage.textContent = 'Please enter both first and last name!';
                    errorMessage.style.display = 'block';
                } else {
                    alert('Please enter both first and last name!');
                }
                return;
            }

            if (nameParts.length === 2) {
                firstname = nameParts[0];
                lastname = nameParts[1];
            } else {
                firstname = nameParts[0];
                lastname = nameParts[nameParts.length - 1];
                middlename = nameParts.slice(1, nameParts.length - 1).join(' ');
            }

            // Prepare data for API
            const userData = {
                firstname: firstname,
                lastname: lastname,
                middlename: middlename,
                email: email,
                password: password
            };

            // Log the data being sent (without password)
            console.log('Sending registration data:', {
                firstname: firstname,
                lastname: lastname,
                middlename: middlename,
                email: email,
                password: '********' // Don't log the actual password
            });

            // Send registration request to API
            fetch('/api/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            })
            .then(response => {
                console.log('Registration response status:', response.status);
                return response.json().then(data => {
                    if (!response.ok) {
                        console.error('Registration error data:', data);
                        if (data.email) {
                            throw new Error('Email may already be in use.');
                        } else if (data.password) {
                            throw new Error('Password error: ' + data.password);
                        } else if (data.firstname) {
                            throw new Error('First name error: ' + data.firstname);
                        } else if (data.lastname) {
                            throw new Error('Last name error: ' + data.lastname);
                        } else {
                            throw new Error('Registration failed. Please try again.');
                        }
                    }
                    return data;
                });
            })
            .then(data => {
                // Store tokens in localStorage
                localStorage.setItem('access', data.tokens.access);
                localStorage.setItem('refresh', data.tokens.refresh);

                // Redirect to dashboard
                window.location.href = '/dashboard.html';
            })
            .catch(error => {
                console.error('Registration error:', error);

                // Log the full error for debugging
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                });

                if (errorMessage) {
                    errorMessage.textContent = error.message || 'Registration failed. Please try again.';
                    errorMessage.style.display = 'block';
                } else {
                    alert(error.message || 'Registration failed. Please try again.');
                }
            });
        });
    }
});
