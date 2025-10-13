async function handleLogout() {
    const refreshToken = localStorage.getItem('refresh');

    if (!refreshToken) {
        // If there's no token, just clear storage and redirect
        clearLocalStorageAndRedirect();
        return;
    }

    try {
        const response = await fetch('/api/logout/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // You may need to send the access token for authentication, depending on your setup
                'Authorization': `Bearer ${localStorage.getItem('access')}` 
            },
            body: JSON.stringify({ 'refresh': refreshToken })
        });

        if (!response.ok) {
            // If the server responds with an error, log it but still log the user out on the frontend
            console.error('Server logout failed:', await response.json());
        } else {
            console.log('Server logout successful.');
        }

    } catch (error) {
        // If the fetch request itself fails (e.g., network error), log it.
        console.error('Error during logout request:', error);
    } finally {
        // --- CRITICAL ---
        // Always clear local storage and redirect, regardless of whether the server call succeeded.
        // This ensures the user is logged out from the frontend even if the server is unreachable.
        clearLocalStorageAndRedirect();
    }
}

function clearLocalStorageAndRedirect() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    // You might also want to remove other user-related data
    // localStorage.removeItem('user'); 

    // Redirect to the login page
    window.location.replace('/login/');
}

// Example of how to attach this to a logout button in your dashboard:
document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logout-button'); // Make sure you have a button with this ID
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
});