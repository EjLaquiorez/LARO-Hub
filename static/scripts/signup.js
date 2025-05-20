// Import auth service
import authService from './auth-service.js';

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already authenticated
    if (authService.isAuthenticated()) {
        // User is authenticated, redirect to dashboard
        window.location.replace("/dashboard/");
        return;
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
        form.addEventListener('submit', async function(e) {
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

            // Show loading state
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Creating Account...';
            submitButton.disabled = true;

            try {
                // Register user using auth service
                await authService.register(userData);

                // Redirect to dashboard on success
                window.location.href = '/dashboard/';
            } catch (error) {
                console.error('Registration error:', error);

                // Log the full error for debugging
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                });

                // Display error message
                let errorText = 'Registration failed. Please try again.';

                // Try to extract specific error messages from the error
                if (error.message) {
                    if (error.message.includes('email')) {
                        errorText = 'Email may already be in use.';
                    } else if (error.message.includes('password')) {
                        errorText = 'Password error: ' + error.message;
                    } else if (error.message.includes('firstname')) {
                        errorText = 'First name error: ' + error.message;
                    } else if (error.message.includes('lastname')) {
                        errorText = 'Last name error: ' + error.message;
                    } else {
                        errorText = error.message;
                    }
                }

                if (errorMessage) {
                    errorMessage.textContent = errorText;
                    errorMessage.style.display = 'block';
                } else {
                    alert(errorText);
                }
            } finally {
                // Restore button state
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            }
        });
    }
});
