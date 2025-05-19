/**
 * LARO-Hub Notification Initializer
 * 
 * This script initializes the notification system on all pages.
 * It should be included on all pages after the notification services.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if notification services are available
    if (!window.notificationService) {
        console.error('Notification service not available');
        return;
    }
    
    if (!window.notificationComponent) {
        console.error('Notification component not available');
        return;
    }
    
    // Initialize notification component
    window.notificationComponent.initialize();
    
    // Create global notification container for toast notifications
    if (window.notifications) {
        // Set custom options for toast notifications
        window.notifications.options.position = 'top-right';
        window.notifications.options.duration = 5000;
        window.notifications.options.maxNotifications = 3;
    }
    
    // Add login/logout event listeners
    document.addEventListener('login', function() {
        // Reinitialize notification service after login
        if (window.notificationService) {
            window.notificationService.initialize();
        }
    });
    
    document.addEventListener('logout', function() {
        // Stop polling on logout
        if (window.notificationService) {
            window.notificationService.stopPolling();
        }
    });
    
    // Add event listener for new messages
    document.addEventListener('new-message', function(event) {
        if (window.notifications && event.detail) {
            // Show toast notification
            window.notifications.info({
                title: 'New Message',
                message: `New message from ${event.detail.sender}: ${event.detail.content}`,
                duration: 5000
            });
        }
    });
    
    // Add event listener for game invitations
    document.addEventListener('game-invitation', function(event) {
        if (window.notifications && event.detail) {
            // Show toast notification
            window.notifications.laro({
                title: 'Game Invitation',
                message: `You've been invited to join ${event.detail.game}`,
                duration: 8000,
                buttonText: 'View',
                buttonCallback: function() {
                    window.location.href = '/notifications/';
                }
            });
        }
    });
    
    console.log('Notification system initialized');
});
