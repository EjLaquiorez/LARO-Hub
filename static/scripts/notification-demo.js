/**
 * LARO-Hub Notification Demo
 * This file demonstrates how to use the notification service and test the notification system
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if notification service is available
    if (!window.notificationService) {
        console.error('Notification service not available');
        return;
    }

    // Check if test container exists
    const testContainer = document.getElementById('test-container');
    if (testContainer) {
        // Create a row container for notification buttons
        const notificationButtonsRow = document.createElement('div');
        notificationButtonsRow.style.gridColumn = '1 / span 2';
        notificationButtonsRow.style.display = 'grid';
        notificationButtonsRow.style.gridTemplateColumns = 'repeat(2, 1fr)';
        notificationButtonsRow.style.gap = '8px';
        notificationButtonsRow.style.marginTop = '4px';

        // Add a "Clear All Notifications" button
        const clearAllButton = document.createElement('button');
        clearAllButton.textContent = 'Clear All Notifications';
        clearAllButton.id = 'clear-all-notifications-btn';

        // Apply LARO-Hub design system styling with red color scheme
        clearAllButton.style.padding = '10px 8px';
        clearAllButton.style.backgroundColor = '#ff3b30'; // Red color
        clearAllButton.style.color = '#fff';
        clearAllButton.style.border = 'none';
        clearAllButton.style.borderRadius = '8px';
        clearAllButton.style.cursor = 'pointer';
        clearAllButton.style.fontWeight = 'bold';
        clearAllButton.style.fontFamily = 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
        clearAllButton.style.fontSize = '12px';
        clearAllButton.style.textAlign = 'center';
        clearAllButton.style.transition = 'all 0.3s ease';
        clearAllButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
        clearAllButton.style.width = '100%';
        clearAllButton.style.height = '100%';

        // Add hover effect for the clear button
        clearAllButton.onmouseover = () => {
            clearAllButton.style.backgroundColor = '#e0352b'; // Darker red on hover
            clearAllButton.style.transform = 'translateY(-2px)';
            clearAllButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        };

        clearAllButton.onmouseout = () => {
            clearAllButton.style.backgroundColor = '#ff3b30';
            clearAllButton.style.transform = 'translateY(0)';
            clearAllButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
        };

        // Add click event to clear all notifications
        clearAllButton.addEventListener('click', function() {
            if (window.notificationService) {
                window.notificationService.clearNotifications();

                // Update badge count
                if (window.notificationComponent) {
                    window.notificationComponent.updateBadge(0);
                }

                // Show toast notification
                if (window.notifications) {
                    window.notifications.info({
                        title: 'Notifications Cleared',
                        message: 'All notifications have been cleared',
                        duration: 3000
                    });
                }
            }
        });

        // Add a "Notification Demo" button
        const demoButton = document.createElement('button');
        demoButton.textContent = 'Notification Demo';
        demoButton.id = 'notification-demo-btn';

        // Apply LARO-Hub design system styling
        demoButton.style.padding = '10px 8px';
        demoButton.style.backgroundColor = '#3897f0';
        demoButton.style.color = '#fff';
        demoButton.style.border = 'none';
        demoButton.style.borderRadius = '8px';
        demoButton.style.cursor = 'pointer';
        demoButton.style.fontWeight = 'bold';
        demoButton.style.fontFamily = 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
        demoButton.style.fontSize = '12px';
        demoButton.style.textAlign = 'center';
        demoButton.style.transition = 'all 0.3s ease';
        demoButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
        demoButton.style.width = '100%';
        demoButton.style.height = '100%';

        // Add hover effect
        demoButton.onmouseover = () => {
            demoButton.style.backgroundColor = '#2d7dd2';
            demoButton.style.transform = 'translateY(-2px)';
            demoButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        };

        demoButton.onmouseout = () => {
            demoButton.style.backgroundColor = '#3897f0';
            demoButton.style.transform = 'translateY(0)';
            demoButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
        };

        demoButton.addEventListener('click', function() {
            addRandomNotification();
        });

        // Add buttons to the row container (clear button first, then demo button)
        notificationButtonsRow.appendChild(clearAllButton);
        notificationButtonsRow.appendChild(demoButton);

        // Add the row container to the test container
        testContainer.appendChild(notificationButtonsRow);
    } else {
        // If test container doesn't exist, add demo controls to the page
        addDemoControls();
        initDemo();
    }
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
            type: 'message',
            title: 'New Message',
            content: 'You have a new message from John Doe.',
            data: {
                sender_id: 1,
                sender_name: 'John Doe',
                message_id: Math.floor(Math.random() * 1000)
            }
        },
        {
            type: 'game_invitation',
            title: 'Game Invitation',
            content: 'You have been invited to join a basketball game at Palumco Court.',
            data: {
                game_id: Math.floor(Math.random() * 1000),
                game_title: 'Weekend Friendly Match',
                inviter_name: 'Michael Jordan'
            }
        },
        {
            type: 'game_update',
            title: 'Game Update',
            content: 'Your scheduled game has been rescheduled to 7:00 PM.',
            data: {
                game_id: Math.floor(Math.random() * 1000),
                game_title: 'Basketball Tournament',
                update_type: 'time_change'
            }
        },
        {
            type: 'system',
            title: 'System Notification',
            content: 'Your account has been successfully verified.',
            data: {
                action_required: false,
                priority: 'low'
            }
        },
        {
            type: 'message',
            title: 'New Group Message',
            content: 'You have a new message in the Basketball Team group.',
            data: {
                sender_id: 2,
                sender_name: 'Basketball Team',
                message_id: Math.floor(Math.random() * 1000),
                is_group: true
            }
        }
    ];

    // Select a random notification type
    const randomIndex = Math.floor(Math.random() * notificationTypes.length);
    const notification = notificationTypes[randomIndex];

    // Add the notification
    window.notificationService.addNotification(notification);

    // Update badge count
    if (window.notificationComponent) {
        window.notificationComponent.updateBadge(window.notificationService.getUnreadCount());
    }

    // Show toast notification
    if (window.notifications) {
        window.notifications.info({
            title: 'Demo Notification',
            message: `Created a new ${notification.type} notification`,
            duration: 3000
        });
    }
}
