/**
 * LARO-Hub Notification Demo
 * This file demonstrates how to use the notification service
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if notification service is available
    if (!window.notificationService) {
        console.error('Notification service not available');
        return;
    }

    // Add demo controls to the page
    addDemoControls();

    // Initialize demo
    initDemo();
});

/**
 * Add demo controls to the page
 */
function addDemoControls() {
    // Create demo container
    const demoContainer = document.createElement('div');
    demoContainer.className = 'notification-demo-container';
    demoContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #1e1e1e;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        width: 300px;
        color: white;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;

    // Add title
    const title = document.createElement('h3');
    title.textContent = 'Notification Demo';
    title.style.cssText = `
        margin: 0 0 10px 0;
        font-size: 16px;
        color: #ffc925;
    `;
    demoContainer.appendChild(title);

    // Add buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;

    // Add notification button
    const addButton = document.createElement('button');
    addButton.textContent = 'Add New Notification';
    addButton.id = 'add-notification-btn';
    addButton.style.cssText = `
        background-color: #ffc925;
        color: #000;
        border: none;
        border-radius: 4px;
        padding: 8px 12px;
        cursor: pointer;
        font-weight: bold;
    `;
    buttonContainer.appendChild(addButton);

    // Mark all as read button
    const markAllButton = document.createElement('button');
    markAllButton.textContent = 'Mark All as Read';
    markAllButton.id = 'mark-all-btn';
    markAllButton.style.cssText = `
        background-color: #333;
        color: #fff;
        border: none;
        border-radius: 4px;
        padding: 8px 12px;
        cursor: pointer;
    `;
    buttonContainer.appendChild(markAllButton);

    // Clear all button
    const clearAllButton = document.createElement('button');
    clearAllButton.textContent = 'Clear All Notifications';
    clearAllButton.id = 'clear-all-btn';
    clearAllButton.style.cssText = `
        background-color: #ff3b30;
        color: #fff;
        border: none;
        border-radius: 4px;
        padding: 8px 12px;
        cursor: pointer;
    `;
    buttonContainer.appendChild(clearAllButton);

    demoContainer.appendChild(buttonContainer);

    // Add to page
    document.body.appendChild(demoContainer);
}

/**
 * Initialize demo functionality
 */
function initDemo() {
    // Add notification button
    const addButton = document.getElementById('add-notification-btn');
    if (addButton) {
        addButton.addEventListener('click', function() {
            addRandomNotification();
        });
    }

    // Mark all as read button
    const markAllButton = document.getElementById('mark-all-btn');
    if (markAllButton) {
        markAllButton.addEventListener('click', function() {
            window.notificationService.markAllAsRead();
        });
    }

    // Clear all button
    const clearAllButton = document.getElementById('clear-all-btn');
    if (clearAllButton) {
        clearAllButton.addEventListener('click', function() {
            window.notificationService.clearNotifications();
        });
    }
}

/**
 * Add a random notification
 */
function addRandomNotification() {
    const notificationTypes = [
        {
            type: 'login',
            content: 'You approved a login from a new device.',
            avatar: '/static/img/avatar1.jpg'
        },
        {
            type: 'game',
            content: 'Your game at Quezon City Circle is starting in 30 minutes.',
            avatar: '/static/img/laro-icon.png'
        },
        {
            type: 'login',
            content: 'Someone tried to access your account from an unknown location.',
            avatar: '/static/img/avatar2.jpg'
        },
        {
            isAlert: true,
            content: 'Your subscription will expire in 3 days. Renew now to avoid interruption.',
        },
        {
            type: 'game',
            content: 'You have been invited to join a game at Brgy. Palumco.',
            avatar: '/static/img/avatar3.jpg'
        }
    ];

    // Select a random notification type
    const randomIndex = Math.floor(Math.random() * notificationTypes.length);
    const notification = notificationTypes[randomIndex];

    // Add the notification
    window.notificationService.addNotification(notification);
}
