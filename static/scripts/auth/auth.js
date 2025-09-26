document.addEventListener('DOMContentLoaded', () => {
    // Find all logout links on the page (can be in nav, sidebar, etc.)
    const logoutLinks = document.querySelectorAll('.logout-link');

    if (logoutLinks.length > 0) {
        logoutLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault(); // Prevent the link from navigating immediately

                // Clear the tokens from client-side storage
                localStorage.removeItem('access');
                localStorage.removeItem('refresh'); // Also clear the refresh token

                // Log for debugging
                console.log('User logged out. Tokens cleared.');

                // Redirect to the login page
                window.location.href = '/login/';
            });
        });
    }
});
