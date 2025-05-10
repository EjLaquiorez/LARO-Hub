/**
 * LARO-Hub Notification Demo
 * This file demonstrates how to use the notification system
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if notification system is loaded
    if (!window.notifications) {
        console.error('Notification system not loaded!');
        return;
    }

    // Example: Show a success notification
    function showSuccessNotification() {
        window.notifications.success({
            title: 'Success!',
            message: 'Your action was completed successfully.',
            duration: 5000
        });
    }

    // Example: Show an error notification
    function showErrorNotification() {
        window.notifications.error({
            title: 'Error!',
            message: 'Something went wrong. Please try again.',
            duration: 0, // Won't auto-dismiss
            buttonText: 'Retry',
            buttonCallback: function() {
                console.log('Retry clicked');
                window.notifications.info({
                    message: 'Retrying...'
                });
            }
        });
    }

    // Example: Show a warning notification
    function showWarningNotification() {
        window.notifications.warning({
            title: 'Warning!',
            message: 'This action cannot be undone.',
            buttonText: 'Proceed Anyway',
            buttonCallback: function() {
                console.log('Proceed clicked');
                window.notifications.success({
                    message: 'Action completed!'
                });
            }
        });
    }

    // Example: Show an info notification
    function showInfoNotification() {
        window.notifications.info({
            title: 'Information',
            message: 'Your game will start in 10 minutes.',
            onClick: function() {
                console.log('Notification clicked');
                window.notifications.info({
                    message: 'Opening game details...'
                });
            }
        });
    }

    // Example: Show a LARO-themed notification
    function showLaroNotification() {
        window.notifications.laro({
            title: 'LARO Update',
            message: 'New basketball court added near your location!',
            buttonText: 'View Court',
            buttonCallback: function() {
                console.log('View court clicked');
            }
        });
    }

    // Example: Show a notification for a new message
    function showNewMessageNotification(sender, message) {
        window.notifications.info({
            title: `New Message from ${sender}`,
            message: message,
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4.414a1 1 0 0 0-.707.293L.854 15.146A.5.5 0 0 1 0 14.793zm5 4a1 1 0 1 0-2 0 1 1 0 0 0 2 0m4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/></svg>',
            onClick: function() {
                console.log('Opening chat with', sender);
            }
        });
    }

    // Example: Show a notification for a game invitation
    function showGameInvitationNotification(league, time, location) {
        window.notifications.laro({
            title: `Invitation: ${league}`,
            message: `${time} at ${location}`,
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2m.995-14.901a1 1 0 1 0-1.99 0A5 5 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901"/></svg>',
            buttonText: 'See Invite',
            buttonCallback: function() {
                console.log('Opening invitation for', league);
            }
        });
    }

    // Example: Show a notification for a new follower
    function showNewFollowerNotification(follower) {
        window.notifications.success({
            title: 'New Follower',
            message: `${follower} is now following you!`,
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/><path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/></svg>',
            buttonText: 'View Profile',
            buttonCallback: function() {
                console.log('Viewing profile of', follower);
            }
        });
    }

    // Add demo buttons if they exist
    const successBtn = document.getElementById('demo-success-notification');
    if (successBtn) successBtn.addEventListener('click', showSuccessNotification);

    const errorBtn = document.getElementById('demo-error-notification');
    if (errorBtn) errorBtn.addEventListener('click', showErrorNotification);

    const warningBtn = document.getElementById('demo-warning-notification');
    if (warningBtn) warningBtn.addEventListener('click', showWarningNotification);

    const infoBtn = document.getElementById('demo-info-notification');
    if (infoBtn) infoBtn.addEventListener('click', showInfoNotification);

    const laroBtn = document.getElementById('demo-laro-notification');
    if (laroBtn) laroBtn.addEventListener('click', showLaroNotification);

    const messageBtn = document.getElementById('demo-message-notification');
    if (messageBtn) messageBtn.addEventListener('click', function() {
        showNewMessageNotification('John Doe', 'Hey, are you up for a game tonight?');
    });

    const inviteBtn = document.getElementById('demo-invite-notification');
    if (inviteBtn) inviteBtn.addEventListener('click', function() {
        showGameInvitationNotification('Mahi League', 'December 13, 10pm', 'Pallumo Court');
    });

    const followerBtn = document.getElementById('demo-follower-notification');
    if (followerBtn) followerBtn.addEventListener('click', function() {
        showNewFollowerNotification('Lance Nah Bro');
    });

    // Example of how to use notifications in your application
    console.log('Notification demo loaded. You can use the following in your code:');
    console.log('window.notifications.success({ title: "Title", message: "Message" })');
    console.log('window.notifications.error({ title: "Title", message: "Message" })');
    console.log('window.notifications.warning({ title: "Title", message: "Message" })');
    console.log('window.notifications.info({ title: "Title", message: "Message" })');
    console.log('window.notifications.laro({ title: "Title", message: "Message" })');
});
