/**
 * Registration Form Handler
 * Handles registration form submission and validation
 */

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return; // Not on registration page
    
    // Add form submission handler
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Get form data
        const firstname = document.getElementById('firstname').value;
        const lastname = document.getElementById('lastname').value;
        const middlename = document.getElementById('middlename')?.value || '';
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Validate form data
        if (!firstname || !lastname || !email || !password) {
            showRegisterError('Please fill in all required fields');
            return;
        }
        
        if (password !== confirmPassword) {
            showRegisterError('Passwords do not match');
            return;
        }
        
        if (password.length < 8) {
            showRegisterError('Password must be at least 8 characters long');
            return;
        }
        
        // Show loading state
        const submitButton = registerForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="bi bi-arrow-repeat spinning"></i> Registering...';
        
        try {
            // Attempt registration
            const userData = {
                firstname,
                lastname,
                middlename,
                email,
                password
            };
            
            await window.apiService.register(userData);
            
            // Show success message
            showRegisterSuccess('Registration successful! Redirecting to dashboard...');
            
            // Redirect after short delay
            setTimeout(() => {
                window.location.href = '/dashboard/';
            }, 1500);
        } catch (error) {
            console.error('Registration failed:', error);
            showRegisterError(error.message || 'Registration failed. Please try again.');
            
            // Reset button
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
    
    // Function to show registration error
    function showRegisterError(message) {
        const errorElement = document.getElementById('register-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            // Hide after 5 seconds
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        } else {
            // Create error element if it doesn't exist
            const errorDiv = document.createElement('div');
            errorDiv.id = 'register-error';
            errorDiv.className = 'alert alert-danger';
            errorDiv.textContent = message;
            
            // Insert before the form
            registerForm.parentNode.insertBefore(errorDiv, registerForm);
            
            // Hide after 5 seconds
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }
    }
    
    // Function to show registration success
    function showRegisterSuccess(message) {
        const successElement = document.getElementById('register-success');
        if (successElement) {
            successElement.textContent = message;
            successElement.style.display = 'block';
        } else {
            // Create success element if it doesn't exist
            const successDiv = document.createElement('div');
            successDiv.id = 'register-success';
            successDiv.className = 'alert alert-success';
            successDiv.textContent = message;
            
            // Insert before the form
            registerForm.parentNode.insertBefore(successDiv, registerForm);
        }
    }
    
    // Add password strength meter
    const passwordInput = document.getElementById('password');
    const strengthMeter = document.getElementById('password-strength-meter');
    
    if (passwordInput && strengthMeter) {
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            const strength = calculatePasswordStrength(password);
            
            // Update strength meter
            strengthMeter.value = strength;
            
            // Update strength text
            const strengthText = document.getElementById('password-strength-text');
            if (strengthText) {
                if (strength < 2) {
                    strengthText.textContent = 'Weak';
                    strengthText.className = 'text-danger';
                } else if (strength < 4) {
                    strengthText.textContent = 'Medium';
                    strengthText.className = 'text-warning';
                } else {
                    strengthText.textContent = 'Strong';
                    strengthText.className = 'text-success';
                }
            }
        });
    }
    
    // Calculate password strength (0-5)
    function calculatePasswordStrength(password) {
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;
        
        // Character type checks
        if (/[A-Z]/.test(password)) strength += 1; // Uppercase
        if (/[a-z]/.test(password)) strength += 1; // Lowercase
        if (/[0-9]/.test(password)) strength += 1; // Numbers
        if (/[^A-Za-z0-9]/.test(password)) strength += 1; // Special characters
        
        return Math.min(5, strength);
    }
});
