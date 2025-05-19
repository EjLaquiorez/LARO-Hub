/**
 * LARO-Hub New Navigation Script
 * Handles the functionality for the redesigned navigation system
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const header = document.querySelector('.main-header');
    const mobileNav = document.querySelector('.mobile-nav');
    const overviewLink = document.querySelector('.overview-link');
    const searchToggle = document.querySelector('.search-toggle');
    const searchPanel = document.querySelector('.search-panel');
    const searchClose = document.querySelector('.search-close');
    const notificationToggle = document.getElementById('notification-bell');
    const notificationDropdown = document.querySelector('.notification-dropdown');
    const profileToggle = document.getElementById('profile-dropdown-toggle');
    const profileDropdown = document.querySelector('.profile-dropdown');

    // Handle scroll effects - keeping header transparent at all times
    function handleScroll() {
        // No scroll effects needed as header is fully transparent
    }

    // Mobile navigation handling
    function showMobileNav() {
        if (mobileNav) {
            mobileNav.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function hideMobileNav() {
        if (mobileNav) {
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Toggle search panel
    function toggleSearchPanel() {
        searchPanel.classList.toggle('active');

        // Close other dropdowns
        if (searchPanel.classList.contains('active')) {
            closeOtherDropdowns('search');

            // Focus the search input
            setTimeout(() => {
                document.querySelector('.search-input').focus();
            }, 100);
        }
    }

    // Toggle notification dropdown
    function toggleNotificationDropdown(e) {
        e.preventDefault();
        notificationDropdown.classList.toggle('show');

        // Close other dropdowns
        if (notificationDropdown.classList.contains('show')) {
            closeOtherDropdowns('notification');
        }
    }

    // Toggle profile dropdown
    function toggleProfileDropdown(e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent event bubbling

        profileDropdown.classList.toggle('show');

        // Close other dropdowns
        if (profileDropdown.classList.contains('show')) {
            closeOtherDropdowns('profile');

            // Update profile info if available
            updateProfileInfo();
        }
    }

    // Update profile information from current user data
    function updateProfileInfo() {
        try {
            // Get user data from localStorage
            const userData = localStorage.getItem('currentUser');

            if (userData) {
                const user = JSON.parse(userData);

                // Update profile name
                const profileName = document.getElementById('profile-name');
                if (profileName && user.firstname && user.lastname) {
                    profileName.textContent = `${user.firstname} ${user.lastname}`;
                } else if (profileName && user.username) {
                    profileName.textContent = user.username;
                }

                // Update profile email
                const profileEmail = document.getElementById('profile-email');
                if (profileEmail && user.email) {
                    profileEmail.textContent = user.email;
                }

                // Update username display
                const usernameDisplay = document.getElementById('username-display');
                if (usernameDisplay && user.username) {
                    usernameDisplay.textContent = user.username.toUpperCase();
                } else if (usernameDisplay && user.email) {
                    const emailUsername = user.email.split('@')[0];
                    usernameDisplay.textContent = emailUsername.toUpperCase();
                }
            }
        } catch (error) {
            console.error('Error updating profile info:', error);
        }
    }

    // Close all dropdowns
    function closeAllDropdowns() {
        searchPanel.classList.remove('active');
        notificationDropdown.classList.remove('show');
        profileDropdown.classList.remove('show');
    }

    // Close other dropdowns except the specified one
    function closeOtherDropdowns(exceptType) {
        if (exceptType !== 'search') searchPanel.classList.remove('active');
        if (exceptType !== 'notification') notificationDropdown.classList.remove('show');
        if (exceptType !== 'profile') profileDropdown.classList.remove('show');
        if (exceptType !== 'mobile') {
            hideMobileNav();
        }
    }

    // Close dropdowns when clicking outside
    function handleOutsideClick(e) {
        // Don't process if clicking on a dropdown toggle button
        if (e.target.closest('#profile-dropdown-toggle') ||
            e.target.closest('#notification-bell') ||
            e.target.closest('.search-toggle')) {
            return;
        }

        // Search panel
        if (searchPanel && searchPanel.classList.contains('active') &&
            !searchPanel.contains(e.target) &&
            !searchToggle.contains(e.target)) {
            searchPanel.classList.remove('active');
        }

        // Notification dropdown
        if (notificationDropdown && notificationDropdown.classList.contains('show') &&
            !notificationDropdown.contains(e.target) &&
            !notificationToggle.contains(e.target)) {
            notificationDropdown.classList.remove('show');
        }

        // Profile dropdown
        if (profileDropdown && profileDropdown.classList.contains('show') &&
            !profileDropdown.contains(e.target) &&
            !profileToggle.contains(e.target)) {
            profileDropdown.classList.remove('show');
        }

        // Mobile nav (only if clicking outside the header)
        if (mobileNav && mobileNav.classList.contains('active') &&
            !mobileNav.contains(e.target) &&
            !header.contains(e.target)) {
            hideMobileNav();
        }
    }

    // Handle window resize
    function handleResize() {
        // Reset mobile nav on larger screens
        if (window.innerWidth > 992 && mobileNav && mobileNav.classList.contains('active')) {
            hideMobileNav();
        }

        // Adjust header height variable based on screen size
        document.documentElement.style.setProperty(
            '--header-height',
            window.innerWidth <= 768 ? '60px' : '70px'
        );
    }

    // Update notification badge
    function updateNotificationBadge() {
        const badge = document.querySelector('.notification-badge');
        if (!badge) return;

        // Get notification count from service if available
        let count = 0;
        if (window.notificationService) {
            count = window.notificationService.getUnreadCount();
        }

        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }

    // Highlight active nav link based on current page
    function highlightActiveNavLink() {
        const currentPath = window.location.pathname;

        // Determine which page is active
        let activePage = '';

        if (currentPath === '/' || currentPath === '/dashboard/' || currentPath.startsWith('/dashboard')) {
            activePage = 'dashboard';
        } else if (currentPath === '/overview.html' || currentPath.includes('overview')) {
            activePage = 'overview';
        } else if (currentPath === '/courts.html' || currentPath.includes('courts') || currentPath.includes('court')) {
            activePage = 'courts';
        } else if (currentPath === '/games.html' || currentPath.includes('games') || currentPath.includes('game')) {
            activePage = 'games';
        } else if (currentPath === '/profile.html' || currentPath.includes('profile')) {
            activePage = 'profile';
        } else if (currentPath === '/notifications/' || currentPath === '/notifications.html' || currentPath.includes('notifications')) {
            activePage = 'notifications';
        }

        // Update all navigation links
        const allNavLinks = document.querySelectorAll('[data-page]');
        allNavLinks.forEach(link => {
            const page = link.getAttribute('data-page');
            if (page === activePage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Update mobile navigation links
        const mobileLinks = document.querySelectorAll('.mobile-link');
        mobileLinks.forEach(link => {
            const page = link.getAttribute('data-page');
            if (page === activePage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Initialize
    function init() {
        // Initial checks
        handleScroll();
        handleResize();
        highlightActiveNavLink();
        updateNotificationBadge();

        // Event listeners
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);
        document.addEventListener('click', handleOutsideClick);

        // Toggle events
        if (overviewLink) {
            overviewLink.addEventListener('click', function(e) {
                // Only toggle mobile nav on smaller screens
                if (window.innerWidth <= 992) {
                    // If clicking directly on the link, let it navigate
                    if (e.target.tagName === 'A' || e.target.closest('a')) {
                        // Close any open dropdowns
                        closeAllDropdowns();
                        return;
                    }

                    // Otherwise toggle the mobile nav
                    if (mobileNav.classList.contains('active')) {
                        hideMobileNav();
                    } else {
                        showMobileNav();
                    }

                    e.preventDefault();
                    e.stopPropagation();
                }
            });
        }

        if (searchToggle) searchToggle.addEventListener('click', toggleSearchPanel);
        if (searchClose) searchClose.addEventListener('click', () => searchPanel.classList.remove('active'));
        if (notificationToggle) notificationToggle.addEventListener('click', toggleNotificationDropdown);
        if (profileToggle) profileToggle.addEventListener('click', toggleProfileDropdown);

        // Add click handlers to all navigation links
        document.querySelectorAll('a[data-page], .mobile-link').forEach(link => {
            link.addEventListener('click', () => {
                // Close mobile navigation if open
                hideMobileNav();

                // Close all dropdowns
                closeAllDropdowns();
            });
        });

        // Listen for notification updates if service exists
        if (window.notificationService) {
            window.notificationService.addListener(updateNotificationBadge);
        }
    }

    // Initialize the navigation
    init();
});
