/**
 * Test Implementation Script
 * This script tests the implementation of the authentication and API integration
 */

document.addEventListener('DOMContentLoaded', () => {
    // Create test button container
    const testContainer = document.createElement('div');
    testContainer.id = 'test-container';
    testContainer.style.position = 'fixed';
    testContainer.style.bottom = '20px';
    testContainer.style.right = '20px';
    testContainer.style.zIndex = '9999';
    testContainer.style.display = 'grid';
    testContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
    testContainer.style.gap = '8px';
    testContainer.style.padding = '10px';
    testContainer.style.backgroundColor = 'rgba(30, 30, 30, 0.8)';
    testContainer.style.borderRadius = '10px';
    testContainer.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
    testContainer.style.backdropFilter = 'blur(5px)';
    testContainer.style.maxWidth = '400px';

    // Add title to test container
    const title = document.createElement('div');
    title.textContent = 'LARO-Hub Test Tools';
    title.style.gridColumn = '1 / span 2';
    title.style.color = '#ffc925';
    title.style.fontFamily = 'American Captain, sans-serif';
    title.style.fontSize = '16px';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '8px';
    title.style.textAlign = 'center';
    testContainer.appendChild(title);

    document.body.appendChild(testContainer);

    // Add test buttons
    addTestButton('Test Auth', testAuth);
    addTestButton('Test Game Service', testGameService);
    addTestButton('Test Court Service', testCourtService);
    addTestButton('Test Team Service', testTeamService);
    addTestButton('Test Create Game', testCreateGame);
    addTestButton('Test Notifications', testNotifications);

    // Add test results container
    const testResults = document.createElement('div');
    testResults.id = 'test-results';
    testResults.style.position = 'fixed';
    testResults.style.top = '70px';
    testResults.style.left = '20px'; // Position on left side to avoid overlap with notification dropdown
    testResults.style.width = '280px'; // Slightly narrower
    testResults.style.maxHeight = '80vh';
    testResults.style.overflowY = 'auto';
    testResults.style.backgroundColor = 'rgba(30, 30, 30, 0.95)'; // Slightly transparent
    testResults.style.color = '#fff';
    testResults.style.padding = '10px'; // Reduced padding
    testResults.style.borderRadius = '6px';
    testResults.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
    testResults.style.zIndex = '9998';
    testResults.style.display = 'none';
    testResults.style.fontSize = '12px'; // Smaller base font size
    testResults.style.fontFamily = 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';

    // Create header with title and close button
    const headerContainer = document.createElement('div');
    headerContainer.style.display = 'flex';
    headerContainer.style.justifyContent = 'space-between';
    headerContainer.style.alignItems = 'center';
    headerContainer.style.marginBottom = '8px'; // Reduced margin

    // Add title
    const title = document.createElement('h3');
    title.textContent = 'Test Results';
    title.style.margin = '0';
    title.style.fontSize = '14px'; // Smaller title
    title.style.fontWeight = 'bold';
    title.style.color = '#ffc925'; // LARO-Hub yellow

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;'; // × symbol
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.color = '#fff';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '18px';
    closeButton.style.lineHeight = '18px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '0';
    closeButton.style.width = '20px';
    closeButton.style.height = '20px';
    closeButton.style.display = 'flex';
    closeButton.style.justifyContent = 'center';
    closeButton.style.alignItems = 'center';
    closeButton.style.borderRadius = '50%';
    closeButton.style.transition = 'background-color 0.2s ease';

    // Add hover effect
    closeButton.onmouseover = () => {
        closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    };

    closeButton.onmouseout = () => {
        closeButton.style.backgroundColor = 'transparent';
    };

    closeButton.addEventListener('click', () => {
        testResults.style.display = 'none';
    });

    // Assemble header
    headerContainer.appendChild(title);
    headerContainer.appendChild(closeButton);
    testResults.appendChild(headerContainer);

    // Add test output container
    const testOutput = document.createElement('div');
    testOutput.id = 'test-output';
    testOutput.style.maxHeight = 'calc(80vh - 80px)'; // Limit height
    testOutput.style.overflowY = 'auto';
    testOutput.style.paddingRight = '5px'; // Add padding for scrollbar
    testResults.appendChild(testOutput);

    // Add clear button
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear Results';
    clearButton.style.marginTop = '8px';
    clearButton.style.padding = '4px 8px';
    clearButton.style.backgroundColor = 'rgba(183, 28, 28, 0.7)'; // Semi-transparent red
    clearButton.style.color = '#fff';
    clearButton.style.border = 'none';
    clearButton.style.borderRadius = '4px';
    clearButton.style.cursor = 'pointer';
    clearButton.style.fontSize = '11px';
    clearButton.style.width = '100%';
    clearButton.style.transition = 'background-color 0.2s ease';

    // Add hover effect
    clearButton.onmouseover = () => {
        clearButton.style.backgroundColor = 'rgba(183, 28, 28, 0.9)';
    };

    clearButton.onmouseout = () => {
        clearButton.style.backgroundColor = 'rgba(183, 28, 28, 0.7)';
    };

    clearButton.addEventListener('click', () => {
        const testOutput = document.getElementById('test-output');
        if (testOutput) {
            testOutput.innerHTML = '';
            logTestResult('INFO', 'Results cleared');
        }
    });

    testResults.appendChild(clearButton);
    document.body.appendChild(testResults);
});

/**
 * Add a test button to the test container
 * @param {string} label - Button label
 * @param {Function} testFunction - Test function to run
 */
function addTestButton(label, testFunction) {
    const button = document.createElement('button');
    button.textContent = label;

    // Apply LARO-Hub design system styling
    button.style.padding = '10px 8px';
    button.style.backgroundColor = '#ffc925';
    button.style.color = '#000';
    button.style.border = 'none';
    button.style.borderRadius = '8px';
    button.style.cursor = 'pointer';
    button.style.fontWeight = 'bold';
    button.style.fontFamily = 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
    button.style.fontSize = '12px';
    button.style.textAlign = 'center';
    button.style.transition = 'all 0.3s ease';
    button.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    button.style.width = '100%';
    button.style.height = '100%';

    // Add hover effect
    button.onmouseover = () => {
        button.style.backgroundColor = '#e6b722';
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    };

    button.onmouseout = () => {
        button.style.backgroundColor = '#ffc925';
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    };

    // Special styling for notification button
    if (label === 'Test Notifications' || label === 'Notification Demo') {
        button.style.backgroundColor = '#3897f0';
        button.style.color = '#fff';

        button.onmouseover = () => {
            button.style.backgroundColor = '#2d7dd2';
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        };

        button.onmouseout = () => {
            button.style.backgroundColor = '#3897f0';
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
        };
    }

    button.addEventListener('click', async () => {
        // Show test results container
        const testResults = document.getElementById('test-results');
        testResults.style.display = 'block';

        // Clear previous results
        const testOutput = document.getElementById('test-output');
        testOutput.innerHTML = '';

        // Run test function
        try {
            await testFunction();
        } catch (error) {
            logTestResult('ERROR', `Test failed: ${error.message}`);
            console.error('Test error:', error);
        }
    });

    document.getElementById('test-container').appendChild(button);
}

/**
 * Log a test result to the test output
 * @param {string} status - Test status (SUCCESS, ERROR, INFO)
 * @param {string} message - Test message
 */
function logTestResult(status, message) {
    const testOutput = document.getElementById('test-output');
    const resultElement = document.createElement('div');
    resultElement.style.marginBottom = '6px'; // Reduced from 10px
    resultElement.style.padding = '6px 8px'; // Reduced from 10px
    resultElement.style.borderRadius = '3px';
    resultElement.style.fontSize = '12px'; // Reduced font size
    resultElement.style.lineHeight = '1.3'; // Tighter line height
    resultElement.style.display = 'flex'; // Use flexbox for layout
    resultElement.style.alignItems = 'flex-start'; // Align items to the top
    resultElement.style.borderLeft = '3px solid'; // Add left border for status indication

    // Set styling based on status
    if (status === 'SUCCESS') {
        resultElement.style.backgroundColor = 'rgba(76, 175, 80, 0.15)'; // Lighter green with transparency
        resultElement.style.borderLeftColor = '#4CAF50'; // Green border
    } else if (status === 'ERROR') {
        resultElement.style.backgroundColor = 'rgba(244, 67, 54, 0.15)'; // Lighter red with transparency
        resultElement.style.borderLeftColor = '#F44336'; // Red border
    } else {
        resultElement.style.backgroundColor = 'rgba(33, 150, 243, 0.15)'; // Lighter blue with transparency
        resultElement.style.borderLeftColor = '#2196F3'; // Blue border
    }

    // Create status badge
    const statusBadge = document.createElement('span');
    statusBadge.style.display = 'inline-block';
    statusBadge.style.minWidth = '55px'; // Fixed width for alignment
    statusBadge.style.fontWeight = 'bold';
    statusBadge.style.marginRight = '6px';
    statusBadge.style.fontSize = '11px'; // Even smaller font for the badge
    statusBadge.style.textTransform = 'uppercase';

    // Set badge color based on status
    if (status === 'SUCCESS') {
        statusBadge.style.color = '#2E7D32'; // Darker green
    } else if (status === 'ERROR') {
        statusBadge.style.color = '#B71C1C'; // Darker red
    } else {
        statusBadge.style.color = '#0D47A1'; // Darker blue
    }

    statusBadge.textContent = status;

    // Create message element
    const messageElement = document.createElement('span');
    messageElement.textContent = message;
    messageElement.style.flex = '1'; // Take up remaining space
    messageElement.style.wordBreak = 'break-word'; // Prevent overflow for long messages

    // Add elements to result
    resultElement.appendChild(statusBadge);
    resultElement.appendChild(messageElement);

    testOutput.appendChild(resultElement);

    // Scroll to bottom
    testOutput.scrollTop = testOutput.scrollHeight;
}

/**
 * Test authentication functionality
 */
async function testAuth() {
    logTestResult('INFO', 'Testing authentication...');

    // Test if API service exists
    if (!window.apiService) {
        logTestResult('ERROR', 'API service not found');
        return;
    }

    logTestResult('SUCCESS', 'API service found');

    // Test if user is logged in
    const token = localStorage.getItem('access');
    if (!token) {
        logTestResult('INFO', 'No access token found. User is not logged in.');
        return;
    }

    logTestResult('SUCCESS', 'Access token found');

    // Test token validation
    try {
        const isAuthenticated = await window.requireAuth();
        if (isAuthenticated) {
            logTestResult('SUCCESS', 'User is authenticated');

            // Get user data
            const userData = localStorage.getItem('currentUser');
            if (userData) {
                const user = JSON.parse(userData);
                logTestResult('INFO', `Logged in as: ${user.firstname} ${user.lastname} (${user.email})`);
            }
        } else {
            logTestResult('ERROR', 'User authentication failed');
        }
    } catch (error) {
        logTestResult('ERROR', `Authentication check failed: ${error.message}`);
    }
}

/**
 * Test game service functionality
 */
async function testGameService() {
    logTestResult('INFO', 'Testing game service...');

    // Test if game service exists
    if (!window.gameService) {
        logTestResult('ERROR', 'Game service not found');
        return;
    }

    logTestResult('SUCCESS', 'Game service found');

    // Test getting upcoming games
    try {
        const upcomingGames = await window.gameService.getUpcomingGames();
        logTestResult('SUCCESS', `Retrieved ${upcomingGames.length} upcoming games`);

        // Log first game details if available
        if (upcomingGames.length > 0) {
            const game = upcomingGames[0];
            logTestResult('INFO', `First game: ${game.title || game.game_type || 'Unnamed'} on ${game.date} at ${game.time || 'TBD'}`);
        }
    } catch (error) {
        logTestResult('ERROR', `Failed to get upcoming games: ${error.message}`);
    }
}

/**
 * Test court service functionality
 */
async function testCourtService() {
    logTestResult('INFO', 'Testing court service...');

    // Test if court service exists
    if (!window.courtService) {
        logTestResult('ERROR', 'Court service not found');
        return;
    }

    logTestResult('SUCCESS', 'Court service found');

    // Test getting courts
    try {
        const courts = await window.courtService.getCourts();
        logTestResult('SUCCESS', `Retrieved ${courts.length} courts`);

        // Log first court details if available
        if (courts.length > 0) {
            const court = courts[0];
            logTestResult('INFO', `First court: ${court.name} in ${court.location}`);
        }
    } catch (error) {
        logTestResult('ERROR', `Failed to get courts: ${error.message}`);
    }
}

/**
 * Test team service functionality
 */
async function testTeamService() {
    logTestResult('INFO', 'Testing team service...');

    // Test if team service exists
    if (!window.teamService) {
        logTestResult('ERROR', 'Team service not found');
        return;
    }

    logTestResult('SUCCESS', 'Team service found');

    // Test getting teams
    try {
        const teams = await window.teamService.getTeams();
        logTestResult('SUCCESS', `Retrieved ${teams.length} teams`);

        // Log first team details if available
        if (teams.length > 0) {
            const team = teams[0];
            logTestResult('INFO', `First team: ${team.name} (${team.members.length} members)`);
        }

        // Test getting user teams
        const userTeams = await window.teamService.getUserTeams();
        logTestResult('SUCCESS', `Retrieved ${userTeams.length} user teams`);
    } catch (error) {
        logTestResult('ERROR', `Failed to get teams: ${error.message}`);
    }
}

/**
 * Test create game functionality
 */
async function testCreateGame() {
    logTestResult('INFO', 'Testing create game functionality...');

    // Test if game service exists
    if (!window.gameService) {
        logTestResult('ERROR', 'Game service not found');
        return;
    }

    // Test if openCreateGameModal function exists
    if (typeof window.openCreateGameModal !== 'function') {
        logTestResult('ERROR', 'openCreateGameModal function not found');
        return;
    }

    logTestResult('SUCCESS', 'Create game dependencies found');

    // Open create game modal
    window.openCreateGameModal();
    logTestResult('INFO', 'Create game modal opened');

    // Test form validation
    const dateInput = document.getElementById('invitation-date');
    const timeInput = document.getElementById('invitation-time');
    const gameTypeSelect = document.getElementById('game-type');
    const eventNameInput = document.getElementById('event-name');

    if (!dateInput || !timeInput || !gameTypeSelect || !eventNameInput) {
        logTestResult('ERROR', 'Form elements not found');
        return;
    }

    logTestResult('SUCCESS', 'Form elements found');

    // Test location card selection
    const locationCards = document.querySelectorAll('.location-card');
    if (locationCards.length === 0) {
        logTestResult('ERROR', 'Location cards not found');
        return;
    }

    // Select first location card
    locationCards[0].click();
    logTestResult('INFO', `Selected location: ${locationCards[0].getAttribute('data-location')}`);

    // Test form validation
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    timeInput.value = '18:00';
    gameTypeSelect.value = 'casual';
    eventNameInput.value = 'Test Game';

    logTestResult('SUCCESS', 'Form filled with test data');

    // Don't actually submit the form in the test
    logTestResult('INFO', 'Test completed without submitting the form');
}

/**
 * Test notification functionality
 */
async function testNotifications() {
    logTestResult('INFO', 'Testing notification system...');

    // Test if notification service exists
    if (!window.notificationService) {
        logTestResult('ERROR', 'Notification service not found');
        return;
    }

    logTestResult('SUCCESS', 'Notification service found');

    // Test if notification component exists
    if (!window.notificationComponent) {
        logTestResult('ERROR', 'Notification component not found');
        return;
    }

    logTestResult('SUCCESS', 'Notification component found');

    // Test getting notifications
    try {
        const notifications = window.notificationService.getNotifications();
        logTestResult('SUCCESS', `Retrieved ${notifications.length} notifications`);

        // Log unread count
        const unreadCount = window.notificationService.getUnreadCount();
        logTestResult('INFO', `Unread notifications: ${unreadCount}`);

        // Create a test notification
        logTestResult('INFO', 'Creating test notification...');
        const testNotification = window.notificationService.addNotification({
            type: 'system',
            title: 'Test Notification',
            content: 'This is a test notification created at ' + new Date().toLocaleTimeString(),
        });

        logTestResult('SUCCESS', 'Test notification created');

        // Update notification badge
        window.notificationComponent.updateBadge(window.notificationService.getUnreadCount());

        // Test notification types
        logTestResult('INFO', 'Testing notification creation for different types...');

        // Create a message notification
        window.notificationService.addNotification({
            type: 'message',
            title: 'New Message',
            content: 'You have a new message from Test User',
            data: {
                sender_id: 1,
                sender_name: 'Test User',
                message_id: 123
            }
        });

        // Create a game invitation notification
        window.notificationService.addNotification({
            type: 'game_invitation',
            title: 'Game Invitation',
            content: 'You have been invited to join a basketball game',
            data: {
                game_id: 456,
                game_title: 'Friendly Match',
                inviter_name: 'Test User'
            }
        });

        // Create a game update notification
        window.notificationService.addNotification({
            type: 'game_update',
            title: 'Game Update',
            content: 'Your scheduled game has been updated',
            data: {
                game_id: 789,
                game_title: 'Weekend Tournament',
                update_type: 'time_change'
            }
        });

        logTestResult('SUCCESS', 'Created test notifications for different types');

        // Test marking a notification as read
        if (notifications.length > 0) {
            const notificationToMark = notifications[0];
            await window.notificationService.markAsRead(notificationToMark.id);
            logTestResult('SUCCESS', `Marked notification ${notificationToMark.id} as read`);
        }

        // Show notification dropdown
        if (window.notificationComponent) {
            window.notificationComponent.openDropdown();
            logTestResult('INFO', 'Opened notification dropdown');

            // Render notifications in dropdown
            window.notificationComponent.renderNotifications();
            logTestResult('SUCCESS', 'Rendered notifications in dropdown');
        }

        // Test toast notification
        if (window.notifications) {
            window.notifications.info({
                title: 'Test Toast',
                message: 'This is a test toast notification',
                duration: 5000
            });
            logTestResult('SUCCESS', 'Displayed toast notification');
        } else {
            logTestResult('INFO', 'Toast notification system not available');
        }

    } catch (error) {
        logTestResult('ERROR', `Failed to test notifications: ${error.message}`);
    }
}
