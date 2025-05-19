/**
 * Login Form Handler
 * Handles login form submission and validation
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return; // Not on login page
    
    // Get redirect URL from query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect') || '/dashboard/';
    
    // Add form submission handler
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Get form data
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Validate form data
        if (!email || !password) {
            showLoginError('Please enter both email and password');
            return;
        }
        
        // Show loading state
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="bi bi-arrow-repeat spinning"></i> Logging in...';
        
        try {
            // Attempt login
            await window.apiService.login(email, password);
            
            // Show success message
            showLoginSuccess('Login successful! Redirecting...');
            
            // Redirect after short delay
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1000);
        } catch (error) {
            console.error('Login failed:', error);
            showLoginError(error.message || 'Login failed. Please check your credentials and try again.');
            
            // Reset button
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
    
    // Function to show login error
    function showLoginError(message) {
        const errorElement = document.getElementById('login-error');
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
            errorDiv.id = 'login-error';
            errorDiv.className = 'alert alert-danger';
            errorDiv.textContent = message;
            
            // Insert before the form
            loginForm.parentNode.insertBefore(errorDiv, loginForm);
            
            // Hide after 5 seconds
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }
    }
    
    // Function to show login success
    function showLoginSuccess(message) {
        const successElement = document.getElementById('login-success');
        if (successElement) {
            successElement.textContent = message;
            successElement.style.display = 'block';
        } else {
            // Create success element if it doesn't exist
            const successDiv = document.createElement('div');
            successDiv.id = 'login-success';
            successDiv.className = 'alert alert-success';
            successDiv.textContent = message;
            
            // Insert before the form
            loginForm.parentNode.insertBefore(successDiv, loginForm);
        }
    }
    
    // Add "forgot password" functionality
    const forgotPasswordLink = document.getElementById('forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (event) => {
            event.preventDefault();
            alert('Password reset functionality will be implemented soon!');
        });
    }
});
