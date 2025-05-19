/**
 * LARO-Hub Notifications Page
 * This file handles the functionality for the notifications page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initNotificationsPage();

    // Load users for the messages tab
    populateUsers();

    // Initialize notification dropdown
    initNotificationDropdown();

    // Display username in the profile link
    displayUsername();
});

/**
 * Initialize the notifications page
 */
function initNotificationsPage() {
    // Add event listeners for tab switching
    const tabs = document.querySelectorAll('[data-bs-toggle="tab"]');
    tabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(event) {
            const targetId = event.target.getAttribute('data-bs-target').substring(1);
            console.log(`Switched to tab: ${targetId}`);

            // Handle specific tab actions
            if (targetId === 'messages') {
                populateUsers();
            }
        });
    });

    // Add event listeners for invitation actions
    const acceptButtons = document.querySelectorAll('.invitation-actions .btn-primary');
    acceptButtons.forEach(button => {
        button.addEventListener('click', function() {
            const invitationItem = this.closest('.invitation-item');
            const title = invitationItem.querySelector('h3').textContent;

            // Show notification
            showNotification('success', `Accepted invitation to ${title}`, 'You will receive details shortly.');

            // Update UI
            invitationItem.style.opacity = '0.5';
            this.disabled = true;
            this.textContent = 'Accepted';

            // Disable decline button
            const declineButton = invitationItem.querySelector('.btn-outline-secondary');
            declineButton.disabled = true;
        });
    });

    const declineButtons = document.querySelectorAll('.invitation-actions .btn-outline-secondary');
    declineButtons.forEach(button => {
        button.addEventListener('click', function() {
            const invitationItem = this.closest('.invitation-item');
            const title = invitationItem.querySelector('h3').textContent;

            // Show notification
            showNotification('info', `Declined invitation to ${title}`, 'The organizer will be notified.');

            // Update UI
            invitationItem.style.opacity = '0.5';
            this.disabled = true;
            this.textContent = 'Declined';

            // Disable accept button
            const acceptButton = invitationItem.querySelector('.btn-primary');
            acceptButton.disabled = true;
        });
    });

    // Add event listeners for update actions
    const viewProfileButtons = document.querySelectorAll('.update-actions .btn-primary');
    viewProfileButtons.forEach(button => {
        button.addEventListener('click', function() {
            const updateItem = this.closest('.update-item');
            const username = updateItem.querySelector('h3').textContent;

            // In a real app, this would navigate to the user's profile
            console.log(`Viewing profile of ${username}`);
            showNotification('info', `Viewing ${username}'s profile`, 'Redirecting...');
        });
    });

    const followBackButtons = document.querySelectorAll('.update-actions .btn-outline-secondary');
    followBackButtons.forEach(button => {
        button.addEventListener('click', function() {
            const updateItem = this.closest('.update-item');
            const username = updateItem.querySelector('h3').textContent;

            // Show notification
            showNotification('success', `You are now following ${username}`, 'They will be notified of your follow.');

            // Update UI
            this.disabled = true;
            this.textContent = 'Following';
            this.classList.remove('btn-outline-secondary');
            this.classList.add('btn-success');
        });
    });

    // Mark all notifications as read when viewing the notifications page
    if (window.notificationService) {
        // Don't automatically mark all as read, just update the counts
        updateNotificationCounts();

        // Listen for notification changes
        window.notificationService.addListener(() => {
            updateNotificationCounts();
        });

        // Add a "Mark All as Read" button to the page
        const notificationsHeader = document.querySelector('.notifications-header');
        if (notificationsHeader) {
            const markAllReadBtn = document.createElement('button');
            markAllReadBtn.className = 'btn btn-warning mark-all-read-btn';
            markAllReadBtn.innerHTML = '<i class="bi bi-check-all"></i> Mark All as Read';
            markAllReadBtn.addEventListener('click', async () => {
                await window.notificationService.markAllAsRead();
                showNotification('success', 'All notifications marked as read', '');
                updateNotificationCounts();
            });
            notificationsHeader.appendChild(markAllReadBtn);
        }
    }
}

/**
 * Update notification counts on tabs
 */
function updateNotificationCounts() {
    if (!window.notificationService) return;

    // Get notifications by type
    const notifications = window.notificationService.getNotifications();

    // Count notifications by type
    const messageNotifications = notifications.filter(n => n.type === 'message' && !n.is_read);
    const invitationNotifications = notifications.filter(n => n.type === 'game_invitation' && !n.is_read);
    const updateNotifications = notifications.filter(n =>
        (n.type === 'game_update' || n.type === 'system') && !n.is_read
    );

    // Update messages tab
    updateTabBadge('messages-tab', messageNotifications.length);

    // Update invitations tab
    updateTabBadge('invitations-tab', invitationNotifications.length);

    // Update updates tab
    updateTabBadge('updates-tab', updateNotifications.length);
}

/**
 * Update badge on a tab
 * @param {string} tabId - Tab ID
 * @param {number} count - Count to display
 */
function updateTabBadge(tabId, count) {
    const tab = document.getElementById(tabId);
    if (!tab) return;

    // Update the tab with count
    if (count > 0) {
        // Check if badge already exists
        let badge = tab.querySelector('.badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'badge bg-danger ms-2';
            tab.appendChild(badge);
        }
        badge.textContent = count;
    } else {
        // Remove badge if no unread notifications
        const badge = tab.querySelector('.badge');
        if (badge) {
            badge.remove();
        }
    }
}

/**
 * Show a notification
 * @param {string} type - Notification type (success, error, warning, info)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 */
function showNotification(type, title, message) {
    if (window.notifications) {
        window.notifications[type]({
            title: title,
            message: message
        });
    } else {
        // Fallback if notification system is not available
        alert(`${title}: ${message}`);
    }
}

/**
 * Populate users list for messages tab
 */
async function populateUsers() {
    const usersList = document.getElementById('usersList');
    if (!usersList) return;

    try {
        usersList.innerHTML = `
            <li class="text-center">
                <div class="spinner-border text-warning" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </li>`;

        // Try to fetch real conversations from the API
        let users = [];

        try {
            // Get the auth token
            const token = localStorage.getItem('access');

            if (token) {
                // Fetch conversations
                const response = await fetch('/api/conversations/', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const conversations = await response.json();

                    // Transform conversations into user list
                    if (conversations && conversations.length > 0) {
                        const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;

                        users = conversations.map(conversation => {
                            // Find the other participant (not the current user)
                            const otherParticipant = conversation.participants.find(id => id !== currentUserId);

                            // Get the last message if available
                            const lastMessage = conversation.last_message;

                            return {
                                id: conversation.id,
                                participant_id: otherParticipant,
                                firstname: `User ${otherParticipant}`, // We would need to fetch user details separately
                                lastname: '',
                                profile_picture: 'https://via.placeholder.com/50',
                                last_message: lastMessage ? lastMessage.content : null,
                                time_ago: lastMessage ? formatTimestamp(lastMessage.timestamp) : 'No messages',
                                unread_count: conversation.unread_count || 0
                            };
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }

        // If no real conversations, use mock data
        if (users.length === 0) {
            users = await getMockUsers();
        }

        if (!users || users.length === 0) {
            usersList.innerHTML = '<li class="list-group-item">No conversations found</li>';
            return;
        }

        usersList.innerHTML = users.map(user => `
            <li id="chat-user-${user.id}"
                class="list-group-item d-flex align-items-center">
                <img src="${user.profile_picture || 'https://via.placeholder.com/40'}"
                     class="rounded-circle me-3"
                     style="width: 50px; height: 50px;"
                     alt="${user.firstname}'s avatar"
                     onerror="this.src='https://via.placeholder.com/50'">
                <div class="flex-grow-1">
                    <h5 class="mb-1">${user.firstname} ${user.lastname}</h5>
                    ${user.last_message ?
                        `<p class="mb-1">${user.last_message}</p>` :
                        ''}
                    <small class="text-muted">${user.time_ago}</small>
                </div>
                <div class="d-flex align-items-center">
                    ${user.unread_count ?
                        `<span class="badge bg-danger rounded-pill me-2">
                            ${user.unread_count}
                        </span>` :
                        ''}
                    <button class="btn btn-warning"
                            onclick="openChatRoom('${user.id}', '${user.firstname} ${user.lastname}', '${user.profile_picture || 'https://via.placeholder.com/40'}')">
                        <i class="bi bi-chat-dots-fill"></i> Chat
                    </button>
                </div>
            </li>
        `).join('');
    } catch (error) {
        console.error('Error populating users:', error);
        usersList.innerHTML = '<li class="list-group-item text-danger">Error loading conversations</li>';
    }
}

/**
 * Filter users list based on search term
 * @param {string} searchTerm - Search term
 */
function filterUsers(searchTerm) {
    const usersList = document.getElementById('usersList');
    const items = usersList.getElementsByTagName('li');

    for (let item of items) {
        const userName = item.querySelector('h5')?.textContent || '';
        if (userName.toLowerCase().includes(searchTerm.toLowerCase())) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    }
}

/**
 * Open chat room with user
 * @param {string} userId - User ID
 * @param {string} userName - User name
 * @param {string} userAvatar - User avatar URL
 */
function openChatRoom(userId, userName, userAvatar) {
    // Check if Bootstrap is loaded
    if (!window.bootstrap) {
        // Load Bootstrap dynamically
        const bootstrapCSS = document.createElement("link");
        bootstrapCSS.rel = "stylesheet";
        bootstrapCSS.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css";
        document.head.appendChild(bootstrapCSS);

        const bootstrapJS = document.createElement("script");
        bootstrapJS.src = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/js/bootstrap.bundle.min.js";
        document.body.appendChild(bootstrapJS);

        bootstrapJS.onload = function() {
            createChatRoom(userId, userName, userAvatar);
        };
    } else {
        createChatRoom(userId, userName, userAvatar);
    }
}

/**
 * Create chat room modal
 * @param {string} userId - User ID
 * @param {string} userName - User name
 * @param {string} userAvatar - User avatar URL
 */
function createChatRoom(userId, userName, userAvatar) {
    // Check if chat room already exists
    const existingChat = document.getElementById(`chatRoom-${userId}`);
    if (existingChat) {
        const modal = new bootstrap.Modal(existingChat);
        modal.show();
        return;
    }

    const chatRoomHTML = `
        <div class="modal chat-room" id="chatRoom-${userId}" tabindex="-1">
            <div class="modal-dialog modal-dialog-scrollable">
                <div class="modal-content border border-warning">
                    <div class="modal-header bg-warning py-2">
                        <div class="d-flex align-items-center flex-grow-1">
                            <img src="${userAvatar}" class="rounded-circle me-2" style="width: 30px; height: 30px;">
                            <h6 class="modal-title mb-0">${userName}</h6>
                        </div>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body bg-light" style="height: 300px; overflow-y: auto;">
                        <div id="chatMessages-${userId}" class="d-flex flex-column gap-2">
                            <div class="text-center text-muted">
                                <small>Start a conversation with ${userName}</small>
                            </div>
                        </div>
                    </div>
                    <div class="input-group">
                        <input type="text"
                            class="form-control message-input"
                            id="messageInput-${userId}"
                            placeholder="Type a message...">
                        <button class="btn btn-warning send-message"
                            type="button"
                            data-user-id="${userId}">
                            <i class="bi bi-send"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;

    // Add chat room to the document
    const chatContainer = document.createElement('div');
    chatContainer.innerHTML = chatRoomHTML;
    document.body.appendChild(chatContainer);

    // Show chat room
    const chatRoom = new bootstrap.Modal(document.getElementById(`chatRoom-${userId}`));
    chatRoom.show();

    // Add event listener for send button
    const sendButton = document.querySelector(`#chatRoom-${userId} .send-message`);
    sendButton.addEventListener('click', function() {
        sendMessage(userId);
    });

    // Add event listener for enter key
    const messageInput = document.getElementById(`messageInput-${userId}`);
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage(userId);
        }
    });
}

/**
 * Send message to user
 * @param {string} userId - User ID
 */
function sendMessage(userId) {
    const input = document.getElementById(`messageInput-${userId}`);
    const message = input.value.trim();

    if (!message) return;

    const messagesContainer = document.getElementById(`chatMessages-${userId}`);

    // Add message to chat
    const messageHTML = `
        <div class="sent-message text-end">
            <small class="text-muted">You</small>
            <div class="bg-warning rounded p-2 shadow-sm d-inline-block">
                ${message}
            </div>
            <small class="text-muted d-block">
                ${new Date().toLocaleTimeString()}
            </small>
        </div>`;

    messagesContainer.innerHTML += messageHTML;
    input.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // In a real app, this would send to an API
    console.log(`Sending message to ${userId}: ${message}`);

    // Simulate response after 1 second
    setTimeout(() => {
        const responseHTML = `
            <div class="received-message">
                <small class="text-muted">User</small>
                <div class="bg-white rounded p-2 shadow-sm d-inline-block">
                    This is a simulated response.
                </div>
                <small class="text-muted d-block">
                    ${new Date().toLocaleTimeString()}
                </small>
            </div>`;

        messagesContainer.innerHTML += responseHTML;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1000);
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

/**
 * Get mock users for demo
 * @returns {Promise<Array>} Array of user objects
 */
async function getMockUsers() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return [
        {
            id: '1',
            firstname: 'John',
            lastname: 'Doe',
            profile_picture: 'https://via.placeholder.com/50',
            last_message: 'Hey, are you up for a game tonight?',
            time_ago: '5 minutes ago',
            unread_count: 2
        },
        {
            id: '2',
            firstname: 'Jane',
            lastname: 'Smith',
            profile_picture: 'https://via.placeholder.com/50',
            last_message: 'Great game yesterday!',
            time_ago: '2 hours ago',
            unread_count: 0
        },
        {
            id: '3',
            firstname: 'Mike',
            lastname: 'Johnson',
            profile_picture: 'https://via.placeholder.com/50',
            last_message: 'Are you joining the tournament next week?',
            time_ago: 'Yesterday',
            unread_count: 1
        },
        {
            id: '4',
            firstname: 'Sarah',
            lastname: 'Williams',
            profile_picture: 'https://via.placeholder.com/50',
            last_message: null,
            time_ago: '3 days ago',
            unread_count: 0
        },
        {
            id: '5',
            firstname: 'David',
            lastname: 'Brown',
            profile_picture: 'https://via.placeholder.com/50',
            last_message: 'Let me know when you want to practice',
            time_ago: 'Last week',
            unread_count: 0
        }
    ];
}
