/**
 * LARO-Hub User Profile Actions
 * Handles user profile actions including settings dropdown and sharing functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize profile actions
    initProfileActions();

    // Set up cancel buttons
    setupCancelButtons();
});

/**
 * Initialize profile actions
 */
function initProfileActions() {
    // Set up dropdown toggles
    setupDropdownToggles();

    // Set up action handlers
    setupActionHandlers();

    // Close dropdowns when clicking outside
    setupOutsideClickHandler();
}

/**
 * Set up dropdown toggles
 */
function setupDropdownToggles() {
    const settingsButton = document.getElementById('settings-button');
    const shareButton = document.getElementById('share-button');

    if (settingsButton) {
        settingsButton.addEventListener('click', function(event) {
            event.stopPropagation();
            toggleDropdown(settingsButton);

            // Close other dropdowns
            if (shareButton && shareButton.classList.contains('active')) {
                shareButton.classList.remove('active');
            }
        });
    }

    if (shareButton) {
        shareButton.addEventListener('click', function(event) {
            event.stopPropagation();
            toggleDropdown(shareButton);

            // Close other dropdowns
            if (settingsButton && settingsButton.classList.contains('active')) {
                settingsButton.classList.remove('active');
            }
        });
    }
}

/**
 * Toggle dropdown visibility
 * @param {HTMLElement} button - The dropdown button element
 */
function toggleDropdown(button) {
    button.classList.toggle('active');
}

/**
 * Set up action handlers
 */
function setupActionHandlers() {
    // Settings dropdown actions
    setupSettingsActions();

    // Share dropdown actions
    setupShareActions();
}

/**
 * Set up settings dropdown actions
 */
function setupSettingsActions() {
    // Get all settings action links
    const settingsActions = document.querySelectorAll('.profile-dropdown-menu a[data-action]');

    settingsActions.forEach(action => {
        action.addEventListener('click', function(event) {
            event.preventDefault();

            const actionType = this.getAttribute('data-action');

            // Handle different action types
            switch (actionType) {
                case 'edit-profile':
                    showEditProfileForm();
                    break;
                case 'change-password':
                    showChangePasswordForm();
                    break;
                case 'account-settings':
                    showAccountSettings();
                    break;
            }

            // Close dropdown
            document.getElementById('settings-button').classList.remove('active');
        });
    });
}

/**
 * Set up share dropdown actions
 */
function setupShareActions() {
    // Get all share action buttons
    const shareActions = document.querySelectorAll('.share-dropdown-menu button[data-action]');

    shareActions.forEach(action => {
        action.addEventListener('click', function(event) {
            event.preventDefault();

            const actionType = this.getAttribute('data-action');

            // Handle different action types
            switch (actionType) {
                case 'copy-link':
                    copyProfileLink();
                    break;
                case 'share-facebook':
                    shareOnFacebook();
                    break;
                case 'share-twitter':
                    shareOnTwitter();
                    break;
                case 'generate-public-view':
                    generatePublicView();
                    break;
            }

            // Close dropdown
            document.getElementById('share-button').classList.remove('active');
        });
    });
}

/**
 * Set up outside click handler to close dropdowns
 */
function setupOutsideClickHandler() {
    document.addEventListener('click', function(event) {
        const settingsButton = document.getElementById('settings-button');
        const shareButton = document.getElementById('share-button');

        // Close settings dropdown if clicked outside
        if (settingsButton && settingsButton.classList.contains('active') &&
            !settingsButton.contains(event.target)) {
            settingsButton.classList.remove('active');
        }

        // Close share dropdown if clicked outside
        if (shareButton && shareButton.classList.contains('active') &&
            !shareButton.contains(event.target)) {
            shareButton.classList.remove('active');
        }
    });
}

/**
 * Show edit profile form
 */
function showEditProfileForm() {
    // Get the edit profile form
    const editTab = document.getElementById('edit-tab');

    if (editTab) {
        // Hide all tab contents
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
        });

        // Show edit profile form
        editTab.classList.add('active');

        // Scroll to form
        editTab.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Show change password form
 */
function showChangePasswordForm() {
    // Get the change password form
    const passwordTab = document.getElementById('password-tab');

    if (passwordTab) {
        // Hide all tab contents
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
        });

        // Show change password form
        passwordTab.classList.add('active');

        // Scroll to form
        passwordTab.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Show account settings
 */
function showAccountSettings() {
    // Get the account settings tab
    const settingsTab = document.getElementById('settings-tab');

    if (settingsTab) {
        // Hide all tab contents
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
        });

        // Show account settings
        settingsTab.classList.add('active');

        // Scroll to settings
        settingsTab.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Copy profile link to clipboard
 */
function copyProfileLink() {
    // Get current URL
    const profileUrl = window.location.href;

    // Create a temporary input element
    const tempInput = document.createElement('input');
    tempInput.value = profileUrl;
    document.body.appendChild(tempInput);

    // Select and copy the URL
    tempInput.select();
    document.execCommand('copy');

    // Remove the temporary input
    document.body.removeChild(tempInput);

    // Show toast notification
    showToast('Link copied to clipboard!');
}

/**
 * Share profile on Facebook
 */
function shareOnFacebook() {
    // Get current URL
    const profileUrl = encodeURIComponent(window.location.href);

    // Open Facebook share dialog
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${profileUrl}`, '_blank');
}

/**
 * Share profile on Twitter
 */
function shareOnTwitter() {
    // Get current URL and user name
    const profileUrl = encodeURIComponent(window.location.href);
    const userName = document.getElementById('user-fullname').textContent;
    const shareText = encodeURIComponent(`Check out ${userName}'s basketball profile on LARO-Hub!`);

    // Open Twitter share dialog
    window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${profileUrl}`, '_blank');
}

/**
 * Generate public view of profile
 */
function generatePublicView() {
    // Get current user ID
    const userData = JSON.parse(localStorage.getItem('currentUser'));
    const userId = userData.id;

    // Generate public view URL
    const publicViewUrl = `${window.location.origin}/public-profile/${userId}`;

    // Show toast notification with the URL
    showToast('Public profile link generated!');

    // Create a temporary input element
    const tempInput = document.createElement('input');
    tempInput.value = publicViewUrl;
    document.body.appendChild(tempInput);

    // Select and copy the URL
    tempInput.select();
    document.execCommand('copy');

    // Remove the temporary input
    document.body.removeChild(tempInput);

    // Show toast notification
    showToast('Public profile link copied to clipboard!');
}

/**
 * Show toast notification
 * @param {string} message - Toast message
 */
function showToast(message) {
    const toast = document.getElementById('toast-notification');

    if (toast) {
        // Set message
        toast.textContent = message;

        // Show toast
        toast.classList.add('show');

        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

/**
 * Set up cancel buttons for forms
 */
function setupCancelButtons() {
    // Cancel edit profile button
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', function() {
            // Show the info tab
            showInfoTab();
        });
    }

    // Cancel password change button
    const cancelPasswordBtn = document.getElementById('cancel-password-btn');
    if (cancelPasswordBtn) {
        cancelPasswordBtn.addEventListener('click', function() {
            // Show the info tab
            showInfoTab();
        });
    }
}

/**
 * Show the info tab
 */
function showInfoTab() {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    // Show info tab
    const infoTab = document.getElementById('info-tab');
    if (infoTab) {
        infoTab.classList.add('active');
    }

    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-tab') === 'info') {
            button.classList.add('active');
        }
    });
}