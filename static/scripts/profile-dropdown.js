/**
 * Profile Dropdown Handler
 * Handles the profile dropdown menu functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    // Get profile dropdown elements
    const profileToggle = document.getElementById('profile-dropdown-toggle');
    const profileDropdown = document.querySelector('.profile-dropdown');
    
    if (!profileToggle || !profileDropdown) return;
    
    // Toggle dropdown when clicking the profile link
    profileToggle.addEventListener('click', function(e) {
        e.preventDefault();
        profileDropdown.classList.toggle('show');
        
        // Update profile info when showing dropdown
        if (profileDropdown.classList.contains('show')) {
            updateProfileInfo();
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (profileDropdown.classList.contains('show') &&
            !profileDropdown.contains(event.target) &&
            !profileToggle.contains(event.target)) {
            profileDropdown.classList.remove('show');
        }
    });
    
    // Update profile information from current user data
    function updateProfileInfo() {
        const user = getLoggedInUser();
        if (!user) return;
        
        // Update profile name
        const profileName = document.getElementById('profile-name');
        if (profileName) {
            profileName.textContent = `${user.firstname} ${user.lastname}`;
        }
        
        // Update profile email
        const profileEmail = document.getElementById('profile-email');
        if (profileEmail) {
            profileEmail.textContent = user.email;
        }
    }
    
    // Helper function to get logged in user
    function getLoggedInUser() {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    }
});
