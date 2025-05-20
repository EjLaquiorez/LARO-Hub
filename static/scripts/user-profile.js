/**
 * LARO-Hub User Profile
 * Handles user profile functionality including viewing, editing, and updating user information
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize profile page
    initProfilePage();
});

/**
 * Initialize the profile page
 */
async function initProfilePage() {
    try {
        // Load user data
        await loadUserData();

        // Set up tab navigation
        setupTabNavigation();

        // Set up form handlers
        setupFormHandlers();

        // Set up image upload
        setupImageUpload();

        // Set up settings handlers
        setupSettingsHandlers();
    } catch (error) {
        console.error('Error initializing profile page:', error);
        showError('Failed to load profile data. Please try again later.');
    }
}

/**
 * Load user data from API
 */
async function loadUserData() {
    try {
        // Get current user data
        const userData = await window.apiService.authRequest('/current-user/');

        // Store user data in localStorage for easy access
        localStorage.setItem('currentUser', JSON.stringify(userData));

        // Populate profile info tab
        populateProfileInfo(userData);

        // Populate edit profile form
        populateEditForm(userData);

        return userData;
    } catch (error) {
        console.error('Error loading user data:', error);

        // Try to get user data from localStorage as fallback
        const storedUserData = localStorage.getItem('currentUser');
        if (storedUserData) {
            const userData = JSON.parse(storedUserData);
            populateProfileInfo(userData);
            populateEditForm(userData);
            return userData;
        }

        throw new Error('Failed to load user data');
    }
}

/**
 * Populate profile info tab with user data
 * @param {Object} userData - User data object
 */
function populateProfileInfo(userData) {
    // Set profile image
    const profileImage = document.getElementById('profile-image');
    if (profileImage) {
        profileImage.src = userData.profile_picture || '/static/img/default.jpg';
        profileImage.onerror = () => {
            profileImage.src = '/static/img/default.jpg';
        };
    }

    // Set user name
    const userFullname = document.getElementById('user-fullname');
    if (userFullname) {
        userFullname.textContent = `${userData.firstname} ${userData.lastname}`;
    }

    // Set user email
    const userEmail = document.getElementById('user-email');
    if (userEmail) {
        userEmail.textContent = userData.email;
    }

    // Set user contact email
    const userContactEmail = document.getElementById('user-contact-email');
    if (userContactEmail) {
        userContactEmail.textContent = userData.email;
    }

    // Set user role
    const userRole = document.getElementById('user-role');
    if (userRole) {
        userRole.textContent = userData.role || 'Player';
    }

    // Set user height
    const userHeight = document.getElementById('user-height');
    if (userHeight) {
        userHeight.textContent = userData.height ? `${userData.height} cm` : '--';
    }

    // Set user position
    const userPosition = document.getElementById('user-position');
    if (userPosition) {
        userPosition.textContent = userData.position || '--';
    }

    // Set user experience
    const userExperience = document.getElementById('user-experience');
    if (userExperience) {
        userExperience.textContent = userData.experience_level || '--';
    }

    // Set user bio
    const userBio = document.getElementById('user-bio');
    if (userBio) {
        userBio.textContent = userData.bio || 'No bio available';
    }

    // Set user phone
    const userPhone = document.getElementById('user-phone');
    if (userPhone) {
        userPhone.textContent = userData.phone_number || 'Not provided';
    }
}

/**
 * Populate edit profile form with user data
 * @param {Object} userData - User data object
 */
function populateEditForm(userData) {
    // Set profile image preview
    const profileImagePreview = document.getElementById('profile-image-preview');
    if (profileImagePreview) {
        profileImagePreview.src = userData.profile_picture || '/static/img/default.jpg';
        profileImagePreview.onerror = () => {
            profileImagePreview.src = '/static/img/default.jpg';
        };
    }

    // Set form field values
    setFormValue('firstname', userData.firstname);
    setFormValue('lastname', userData.lastname);
    setFormValue('middlename', userData.middlename);
    setFormValue('email', userData.email);
    setFormValue('phone_number', userData.phone_number);
    setFormValue('birth_date', userData.birth_date);
    setFormValue('height', userData.height);
    setFormValue('position', userData.position);
    setFormValue('experience_level', userData.experience_level);
    setFormValue('skill_level', userData.skill_level);
    setFormValue('bio', userData.bio);
    setFormValue('availability', userData.availability);
}

/**
 * Set form field value
 * @param {string} fieldId - Form field ID
 * @param {string} value - Field value
 */
function setFormValue(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field && value) {
        field.value = value;
    }
}

/**
 * Set up tab navigation
 */
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Get tab ID
            const tabId = button.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');

            // Update URL hash
            window.location.hash = tabId;
        });
    });

    // Check for hash in URL
    const hash = window.location.hash.substring(1);
    if (hash) {
        const tabButton = document.querySelector(`.tab-button[data-tab="${hash}"]`);
        if (tabButton) {
            tabButton.click();
        }
    }
}

/**
 * Set up form handlers
 */
function setupFormHandlers() {
    // Edit profile form
    const editProfileForm = document.getElementById('edit-profile-form');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', handleEditProfileSubmit);
    }

    // Cancel edit button
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            // Reset form with current user data
            const userData = JSON.parse(localStorage.getItem('currentUser'));
            populateEditForm(userData);

            // Switch to info tab
            document.querySelector('.tab-button[data-tab="info"]').click();
        });
    }

    // Change password form
    const changePasswordForm = document.getElementById('change-password-form');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handleChangePasswordSubmit);
    }
}

/**
 * Handle edit profile form submission
 * @param {Event} event - Form submit event
 */
async function handleEditProfileSubmit(event) {
    event.preventDefault();

    try {
        // Show loading state
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="bi bi-arrow-repeat spinning"></i> Saving...';

        // Get form data
        const formData = new FormData(event.target);
        const userData = Object.fromEntries(formData.entries());

        // Get current user ID
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const userId = currentUser.id;

        // Check if profile picture was uploaded
        const profileImageInput = document.getElementById('profile-image-input');
        if (profileImageInput && profileImageInput.files && profileImageInput.files[0]) {
            // Upload profile picture first
            await window.apiService.uploadProfilePicture(userId, profileImageInput.files[0]);

            // Remove profile_picture from userData to avoid conflicts
            delete userData.profile_picture;
        }

        // Update user data
        const updatedUser = await window.apiService.updateUserProfile(userId, userData);

        // Update profile info
        populateProfileInfo(updatedUser);

        // Show success message
        showSuccess('Profile updated successfully!');

        // Switch to info tab after short delay
        setTimeout(() => {
            document.querySelector('.tab-button[data-tab="info"]').click();
        }, 1500);
    } catch (error) {
        console.error('Error updating profile:', error);
        showError('Failed to update profile. Please try again.');
    } finally {
        // Reset button
        const submitButton = event.target.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = 'Save Changes';
    }
}

/**
 * Handle change password form submission
 * @param {Event} event - Form submit event
 */
async function handleChangePasswordSubmit(event) {
    event.preventDefault();

    // Get form data
    const currentPassword = document.getElementById('current_password').value;
    const newPassword = document.getElementById('new_password').value;
    const confirmPassword = document.getElementById('confirm_password').value;

    // Validate passwords match
    if (newPassword !== confirmPassword) {
        showError('New passwords do not match', 'change-password-error');
        return;
    }

    // Validate password requirements
    if (!validatePassword(newPassword)) {
        showError('Password does not meet requirements', 'change-password-error');
        return;
    }

    try {
        // Show loading state
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="bi bi-arrow-repeat spinning"></i> Changing...';

        // Get current user ID
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const userId = currentUser.id;

        // Update password using the API service
        await window.apiService.changePassword(userId, newPassword);

        // Show success message
        showSuccess('Password changed successfully!', 'change-password-success');

        // Clear form
        event.target.reset();
    } catch (error) {
        console.error('Error changing password:', error);
        showError('Failed to change password. Please check your current password and try again.', 'change-password-error');
    } finally {
        // Reset button
        const submitButton = event.target.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = 'Change Password';
    }
}

/**
 * Validate password meets requirements
 * @param {string} password - Password to validate
 * @returns {boolean} Whether password is valid
 */
function validatePassword(password) {
    // At least 8 characters
    if (password.length < 8) return false;

    // At least one uppercase letter
    if (!/[A-Z]/.test(password)) return false;

    // At least one number
    if (!/[0-9]/.test(password)) return false;

    // At least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;

    return true;
}

/**
 * Set up image upload functionality
 */
function setupImageUpload() {
    const profileImagePreview = document.getElementById('profile-image-preview');
    const profileImageInput = document.getElementById('profile-image-input');
    const changePhotoBtn = document.getElementById('change-photo-btn');

    if (profileImagePreview && profileImageInput && changePhotoBtn) {
        // Open file dialog when clicking preview or button
        profileImagePreview.addEventListener('click', () => {
            profileImageInput.click();
        });

        changePhotoBtn.addEventListener('click', () => {
            profileImageInput.click();
        });

        // Handle file selection
        profileImageInput.addEventListener('change', handleImageSelection);
    }
}

/**
 * Handle image selection
 * @param {Event} event - Change event
 */
function handleImageSelection(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
        showError('Please select an image file');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showError('Image file size must be less than 5MB');
        return;
    }

    // Preview image
    const reader = new FileReader();
    reader.onload = function(e) {
        const profileImagePreview = document.getElementById('profile-image-preview');
        if (profileImagePreview) {
            profileImagePreview.src = e.target.result;
        }
    };
    reader.readAsDataURL(file);

    // TODO: Implement image upload to server
    // This would typically be done when the form is submitted
}

/**
 * Set up settings handlers
 */
function setupSettingsHandlers() {
    // Delete account button
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', handleDeleteAccount);
    }

    // 2FA setup button
    const setup2faBtn = document.getElementById('setup-2fa-btn');
    if (setup2faBtn) {
        setup2faBtn.addEventListener('click', () => {
            alert('Two-factor authentication setup is not yet implemented.');
        });
    }
}

/**
 * Handle delete account button click
 */
function handleDeleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        alert('Account deletion is not yet implemented.');
    }
}

/**
 * Show error message
 * @param {string} message - Error message
 * @param {string} elementId - Error element ID (optional)
 */
function showError(message, elementId = 'edit-profile-error') {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';

        // Hide after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

/**
 * Show success message
 * @param {string} message - Success message
 * @param {string} elementId - Success element ID (optional)
 */
function showSuccess(message, elementId = 'edit-profile-success') {
    const successElement = document.getElementById(elementId);
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';

        // Hide after 5 seconds
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 5000);
    }
}
