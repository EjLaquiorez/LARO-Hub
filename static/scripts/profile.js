// Import functions from usercheck.js if they're not already available
// These functions should be available since usercheck.js is loaded before profile.js
// But we'll define fallbacks just in case
if (typeof isTokenValid !== 'function') {
    function isTokenValid(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64).split('').map(c =>
                    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                ).join('')
            );
            const payload = JSON.parse(jsonPayload);
            const now = Math.floor(Date.now() / 1000);
            return payload.exp > now;
        } catch (e) {
            return false;
        }
    }
}

if (typeof refreshAccessToken !== 'function') {
    function refreshAccessToken() {
        return new Promise((resolve, reject) => {
            const refreshToken = localStorage.getItem("refresh");
            if (!refreshToken) {
                reject(new Error("No refresh token found"));
                return;
            }

            fetch("/api/token/refresh/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refresh: refreshToken })
            })
            .then(response => response.json())
            .then(data => {
                if (data.access) {
                    localStorage.setItem("access", data.access);
                    resolve(data.access);
                } else {
                    reject(new Error("Failed to refresh token"));
                }
            })
            .catch(error => {
                console.error('Error refreshing token:', error);
                reject(error);
            });
        });
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    let currentUser = null;

    // Initialize notification dropdown
    initNotificationDropdown();

    // Display username in the profile link
    displayUsername();

    try {
        console.log("Profile page loaded, checking authentication...");

        // Get the access token
        const token = localStorage.getItem("access");
        if (!token) {
            console.error("No access token found in localStorage");
            // Redirect to login page
            window.location.href = "/login/";
            return;
        }

        // Check if token is valid
        if (typeof isTokenValid === 'function' && !isTokenValid(token)) {
            console.log("Token expired, attempting to refresh...");
            try {
                if (typeof refreshAccessToken === 'function') {
                    await refreshAccessToken();
                } else {
                    throw new Error("refreshAccessToken function not available");
                }
            } catch (error) {
                console.error("Token refresh failed:", error);
                // Redirect to login page
                window.location.href = "/login/";
                return;
            }
        }

        console.log("Access token found, fetching user data...");

        // Fetch user data
        fetch("/api/current-user/", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            console.log("Response status:", response.status);
            if (!response.ok) {
                console.error("Response not OK:", response.status);
                throw new Error("Authentication failed.");
            }
            return response.json();
        })
        .then(user => {
            console.log("User data received:", user);
            currentUser = user;
            document.getElementById("full-name").textContent = `${user.firstname} ${user.lastname}`;
            document.getElementById("username").textContent = `@${user.username || 'username'}`;
            document.getElementById("profile-icon").src = user.image_url || "/static/img/default.jpg";

            // Set up profile link for sharing
            const profileUrl = `${window.location.origin}/profile.html?id=${user.id}`;
            document.getElementById("profile-link").value = profileUrl;

            // Generate QR code
            generateQRCode(profileUrl);
        })
        .catch(err => {
            console.error("Error fetching user data:", err);
            // Redirect to login page if authentication failed
            if (err.message === "Authentication failed.") {
                window.location.href = "/login/";
            } else {
                // For other errors, show an error message
                document.getElementById("full-name").textContent = "Error loading profile";
            }
        });
    } catch (error) {
        console.error("Profile initialization error:", error);
        // Redirect to login for authentication errors
        if (error.message && error.message.includes("authentication")) {
            window.location.href = "/login/";
        } else {
            // For other errors, show an error message
            document.getElementById("full-name").textContent = "Error loading profile";
        }
    }

    // Settings dropdown functionality
    const settingsIcon = document.getElementById("settings-icon");
    const editProfileBtn = document.getElementById("edit-profile");
    const changePasswordBtn = document.getElementById("change-password");
    const privacySettingsBtn = document.getElementById("privacy-settings");
    const logoutBtn = document.getElementById("logout");

    // Edit Profile button in dropdown
    editProfileBtn.addEventListener("click", () => {
        openEditProfileModal();
    });

    // Change Password button
    changePasswordBtn.addEventListener("click", () => {
        alert("Change Password functionality will be implemented soon!");
    });

    // Privacy Settings button
    privacySettingsBtn.addEventListener("click", () => {
        alert("Privacy Settings functionality will be implemented soon!");
    });

    // Logout button
    logoutBtn.addEventListener("click", () => {
        // Clear all authentication tokens from localStorage
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("currentUser");

        console.log("User logged out successfully");

        // Redirect to login page
        window.location.href = "/login/";
    });

    // Share Profile button
    const shareBtn = document.getElementById("share-btn");
    const shareModal = document.getElementById("share-modal");

    shareBtn.addEventListener("click", () => {
        shareModal.style.display = "flex";
    });

    // Copy profile link button
    const copyLinkBtn = document.getElementById("copy-link-btn");

    copyLinkBtn.addEventListener("click", () => {
        const profileLink = document.getElementById("profile-link");
        profileLink.select();
        document.execCommand("copy");

        // Show copied feedback
        const originalIcon = copyLinkBtn.innerHTML;
        copyLinkBtn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            copyLinkBtn.innerHTML = originalIcon;
        }, 2000);
    });

    // Social share buttons
    const facebookBtn = document.querySelector(".social-btn.facebook");
    const twitterBtn = document.querySelector(".social-btn.twitter");
    const whatsappBtn = document.querySelector(".social-btn.whatsapp");
    const emailBtn = document.querySelector(".social-btn.email");

    facebookBtn.addEventListener("click", () => {
        const url = encodeURIComponent(document.getElementById("profile-link").value);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    });

    twitterBtn.addEventListener("click", () => {
        const url = encodeURIComponent(document.getElementById("profile-link").value);
        const text = encodeURIComponent("Check out my LARO basketball profile!");
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
    });

    whatsappBtn.addEventListener("click", () => {
        const url = encodeURIComponent(document.getElementById("profile-link").value);
        window.open(`https://wa.me/?text=${url}`, '_blank');
    });

    emailBtn.addEventListener("click", () => {
        const url = document.getElementById("profile-link").value;
        window.location.href = `mailto:?subject=Check out my LARO basketball profile&body=Here's my profile: ${url}`;
    });

    // Close modals
    const closeButtons = document.querySelectorAll(".close-modal");
    const modals = document.querySelectorAll(".modal");

    closeButtons.forEach(button => {
        button.addEventListener("click", () => {
            modals.forEach(modal => {
                modal.style.display = "none";
            });
        });
    });

    // Close modal when clicking outside
    window.addEventListener("click", (event) => {
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    });

    // Edit Profile Modal
    function openEditProfileModal() {
        const editProfileModal = document.getElementById("edit-profile-modal");

        if (currentUser) {
            // Populate form with current user data
            document.getElementById("edit-fullname").value = `${currentUser.firstname} ${currentUser.lastname}`;
            document.getElementById("edit-username").value = currentUser.username || "";
            document.getElementById("edit-bio").value = "Basketball is my game."; // This would come from user data
            document.getElementById("edit-age").value = "21"; // This would come from user data
            document.getElementById("edit-height").value = "5'11\""; // This would come from user data
            document.getElementById("edit-weight").value = "90 kg"; // This would come from user data
            document.getElementById("edit-gender").value = "MALE"; // This would come from user data
        }

        editProfileModal.style.display = "flex";
    }

    // Handle Edit Profile Form Submission
    const editProfileForm = document.getElementById("edit-profile-form");

    editProfileForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(editProfileForm);
        const userData = {
            fullname: formData.get("fullname"),
            username: formData.get("username"),
            bio: formData.get("bio"),
            age: formData.get("age"),
            height: formData.get("height"),
            weight: formData.get("weight"),
            gender: formData.get("gender")
        };

        // For demo purposes, just update the UI
        document.getElementById("full-name").textContent = userData.fullname;
        document.getElementById("username").textContent = `@${userData.username}`;

        // In a real app, you would send this data to the server
        console.log("Profile updated with:", userData);

        // Close the modal
        document.getElementById("edit-profile-modal").style.display = "none";

        // Show success message
        alert("Profile updated successfully!");
    });
});

// Function to generate QR code
function generateQRCode(url) {
    const qrcodeContainer = document.getElementById("qrcode");
    qrcodeContainer.innerHTML = ""; // Clear previous QR code

    new QRCode(qrcodeContainer, {
        text: url,
        width: 180,
        height: 180,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

/**
 * Display the username in the profile navigation link
 */
function displayUsername() {
    const usernameDisplay = document.getElementById('username-display');
    if (!usernameDisplay) return;

    try {
        // Get user data from localStorage
        const userData = localStorage.getItem('currentUser');

        if (userData) {
            const user = JSON.parse(userData);

            // Check if username exists
            if (user && user.username) {
                usernameDisplay.textContent = user.username.toUpperCase();
            } else if (user && user.email) {
                // Fallback to email if username is not available
                const emailUsername = user.email.split('@')[0];
                usernameDisplay.textContent = emailUsername.toUpperCase();
            }
        }
    } catch (error) {
        console.error('Error displaying username:', error);
        // Keep default "PROFILE" text if there's an error
    }
}

/**
 * Initialize notification dropdown functionality
 */
function initNotificationDropdown() {
    const notificationBell = document.getElementById('notification-bell');
    const notificationDropdown = document.querySelector('.notification-dropdown');
    const notificationList = document.querySelector('.notification-list');
    const notificationBadge = document.querySelector('.notification-badge');

    if (!notificationBell || !notificationDropdown || !notificationList) return;

    // Update notification badge count
    function updateNotificationBadge() {
        const unreadCount = window.notificationService.getUnreadCount();
        if (unreadCount > 0) {
            notificationBadge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            notificationBadge.style.display = 'flex';
        } else {
            notificationBadge.style.display = 'none';
        }
    }

    // Render notifications in the dropdown
    function renderNotifications(filter = 'all') {
        // Clear existing notifications
        notificationList.innerHTML = '';

        // Get notifications from service
        let notifications = window.notificationService.getNotifications();

        // Apply filter if needed
        if (filter === 'unread') {
            notifications = notifications.filter(notification => !notification.read);
        }

        // If no notifications, show a message
        if (notifications.length === 0) {
            notificationList.innerHTML = `
                <div class="no-notifications">
                    <p>No notifications to display</p>
                </div>
            `;
            return;
        }

        // Create notification items
        notifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = `notification-item${notification.read ? '' : ' unread'}`;
            notificationItem.dataset.id = notification.id;

            // Format timestamp
            const timestamp = formatTimestamp(notification.timestamp);

            // Create avatar element
            let avatarHtml = '';
            if (notification.isAlert) {
                avatarHtml = `
                    <div class="notification-avatar alert-icon">
                        <i class="bi bi-exclamation-triangle-fill"></i>
                    </div>
                `;
            } else {
                avatarHtml = `
                    <div class="notification-avatar">
                        <img src="${notification.avatar || '/static/img/laro-icon.png'}" alt="Avatar">
                    </div>
                `;
            }

            // Create content
            notificationItem.innerHTML = `
                ${avatarHtml}
                <div class="notification-content">
                    <p>${notification.content}</p>
                    <span class="notification-time">${timestamp}</span>
                </div>
                ${!notification.read ? '<div class="notification-status"><span class="status-dot"></span></div>' : ''}
            `;

            // Add click event to mark as read
            notificationItem.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                window.notificationService.markAsRead(id);
                this.classList.remove('unread');
                const statusDot = this.querySelector('.status-dot');
                if (statusDot) {
                    statusDot.parentElement.remove();
                }
                updateNotificationBadge();
            });

            notificationList.appendChild(notificationItem);
        });
    }

    // Format timestamp to relative time (e.g., "2h ago")
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffDay > 0) {
            return diffDay === 1 ? '1d' : `${diffDay}d`;
        } else if (diffHour > 0) {
            return `${diffHour}h`;
        } else if (diffMin > 0) {
            return `${diffMin}m`;
        } else {
            return 'Just now';
        }
    }

    // Initial render
    updateNotificationBadge();
    renderNotifications();

    // Add listener for notification changes
    window.notificationService.addListener(() => {
        updateNotificationBadge();
        if (notificationDropdown.classList.contains('show')) {
            // If dropdown is open, re-render with current filter
            const activeFilter = document.querySelector('.notification-option.active');
            const filter = activeFilter.textContent.trim().toLowerCase();
            renderNotifications(filter);
        }
    });

    // Toggle dropdown when clicking the bell
    notificationBell.addEventListener('click', function(e) {
        e.preventDefault();
        notificationDropdown.classList.toggle('show');

        // If showing dropdown, re-render notifications
        if (notificationDropdown.classList.contains('show')) {
            renderNotifications();
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function closeDropdown(event) {
        if (notificationDropdown.classList.contains('show') &&
            !notificationDropdown.contains(event.target) &&
            !notificationBell.contains(event.target)) {
            notificationDropdown.classList.remove('show');
        }
    });

    // Handle notification option buttons (All/Unread)
    const notificationOptions = document.querySelectorAll('.notification-option');
    notificationOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent closing the dropdown

            // Remove active class from all options
            notificationOptions.forEach(opt => opt.classList.remove('active'));

            // Add active class to clicked option
            this.classList.add('active');

            // Filter notifications based on option
            const filter = this.textContent.trim().toLowerCase();
            renderNotifications(filter);
        });
    });

    // Handle "See previous notifications" button
    const seePreviousButton = document.querySelector('.see-previous');
    if (seePreviousButton) {
        seePreviousButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent closing the dropdown

            // In a real app, this would load more notifications
            // For demo, we'll just show a message
            this.textContent = 'Loading...';

            setTimeout(() => {
                this.textContent = 'No more notifications';
                this.disabled = true;
            }, 1000);
        });
    }

    // Handle "See all" link
    const seeAllLink = document.querySelector('.see-all');
    if (seeAllLink) {
        seeAllLink.addEventListener('click', function(e) {
            // Mark all as read before navigating
            window.notificationService.markAllAsRead();
            updateNotificationBadge();
        });
    }
}
