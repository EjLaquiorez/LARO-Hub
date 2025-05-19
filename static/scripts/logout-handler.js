/**
 * Logout Handler
 * Handles user logout functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    // Find all logout buttons/links
    const logoutButtons = document.querySelectorAll('.logout-btn, .logout-link, [data-action="logout"]');
    
    // Add click handler to all logout elements
    logoutButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            event.preventDefault();
            
            // Show confirmation dialog
            if (confirm('Are you sure you want to log out?')) {
                try {
                    // Show loading state
                    const originalText = button.textContent;
                    button.disabled = true;
                    button.innerHTML = '<i class="bi bi-arrow-repeat spinning"></i> Logging out...';
                    
                    // Call logout API
                    await window.apiService.logout();
                    
                    // Show success message
                    alert('You have been successfully logged out.');
                    
                    // Redirect to login page
                    window.location.href = '/login.html';
                } catch (error) {
                    console.error('Logout failed:', error);
                    
                    // Show error message
                    alert('Logout failed: ' + (error.message || 'Unknown error'));
                    
                    // Reset button
                    button.disabled = false;
                    button.textContent = originalText;
                }
            }
        });
    });
    
    // Add logout button to profile menu if it doesn't exist
    const profileMenu = document.querySelector('.profile-menu, .profile-dropdown');
    if (profileMenu && !profileMenu.querySelector('[data-action="logout"]')) {
        const logoutItem = document.createElement('li');
        logoutItem.className = 'profile-menu-item';
        
        const logoutLink = document.createElement('a');
        logoutLink.href = '#';
        logoutLink.setAttribute('data-action', 'logout');
        logoutLink.innerHTML = '<i class="bi bi-box-arrow-right"></i> Logout';
        
        logoutItem.appendChild(logoutLink);
        profileMenu.appendChild(logoutItem);
        
        // Add click handler to the new logout link
        logoutLink.addEventListener('click', async (event) => {
            event.preventDefault();
            
            // Show confirmation dialog
            if (confirm('Are you sure you want to log out?')) {
                try {
                    // Show loading state
                    logoutLink.innerHTML = '<i class="bi bi-arrow-repeat spinning"></i> Logging out...';
                    
                    // Call logout API
                    await window.apiService.logout();
                    
                    // Redirect to login page
                    window.location.href = '/login.html';
                } catch (error) {
                    console.error('Logout failed:', error);
                    
                    // Show error message
                    alert('Logout failed: ' + (error.message || 'Unknown error'));
                    
                    // Reset link
                    logoutLink.innerHTML = '<i class="bi bi-box-arrow-right"></i> Logout';
                }
            }
        });
    }
});
