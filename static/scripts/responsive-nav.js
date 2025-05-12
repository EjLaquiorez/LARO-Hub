/**
 * LARO-Hub Responsive Navigation
 * Handles the responsive navigation menu for mobile devices
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create hamburger menu button
    const createHamburgerMenu = () => {
        const navbar = document.querySelector('.navbar');

        // Check if menu toggle already exists
        if (document.querySelector('.menu-toggle')) {
            return;
        }

        // Create menu toggle button
        const menuToggle = document.createElement('div');
        menuToggle.className = 'menu-toggle';
        menuToggle.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;

        // Insert before the first child of navbar
        navbar.appendChild(menuToggle);

        // Add event listener
        menuToggle.addEventListener('click', toggleMobileMenu);
    };

    // Toggle mobile menu
    const toggleMobileMenu = (event) => {
        if (event) {
            event.stopPropagation();
        }

        const navLinks = document.querySelector('.nav-links');
        const menuToggle = document.querySelector('.menu-toggle');
        const navbar = document.querySelector('.navbar');

        if (!navLinks || !menuToggle || !navbar) return;

        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active');
        navbar.classList.toggle('mobile-active');

        // Add animation to hamburger menu
        if (menuToggle.classList.contains('active')) {
            menuToggle.querySelector('span:nth-child(1)').style.transform = 'rotate(45deg) translate(5px, 5px)';
            menuToggle.querySelector('span:nth-child(2)').style.opacity = '0';
            menuToggle.querySelector('span:nth-child(3)').style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            menuToggle.querySelector('span:nth-child(1)').style.transform = 'none';
            menuToggle.querySelector('span:nth-child(2)').style.opacity = '1';
            menuToggle.querySelector('span:nth-child(3)').style.transform = 'none';
        }
    };

    // Handle window resize
    const handleResize = () => {
        const navLinks = document.querySelector('.nav-links');
        const menuToggle = document.querySelector('.menu-toggle');
        const navbar = document.querySelector('.navbar');

        if (!navLinks || !navbar) return;

        // Reset menu state on larger screens
        if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            navbar.classList.remove('mobile-active');
            if (menuToggle) {
                menuToggle.classList.remove('active');
                menuToggle.querySelector('span:nth-child(1)').style.transform = 'none';
                menuToggle.querySelector('span:nth-child(2)').style.opacity = '1';
                menuToggle.querySelector('span:nth-child(3)').style.transform = 'none';
            }
        }

        // Add or remove hamburger menu based on screen size
        if (window.innerWidth <= 768) {
            createHamburgerMenu();
        } else {
            // Remove hamburger menu on larger screens
            const menuToggle = document.querySelector('.menu-toggle');
            if (menuToggle) {
                menuToggle.removeEventListener('click', toggleMobileMenu);
                menuToggle.remove();
            }

            // Ensure nav links are visible on larger screens
            navLinks.style.display = '';
        }
    };

    // Close menu when clicking outside
    const handleClickOutside = (event) => {
        const navLinks = document.querySelector('.nav-links');
        const menuToggle = document.querySelector('.menu-toggle');
        const navbar = document.querySelector('.navbar');

        if (!navLinks || !menuToggle || !navbar) return;

        if (navLinks.classList.contains('active') &&
            !navLinks.contains(event.target) &&
            !menuToggle.contains(event.target)) {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
            navbar.classList.remove('mobile-active');
            menuToggle.querySelector('span:nth-child(1)').style.transform = 'none';
            menuToggle.querySelector('span:nth-child(2)').style.opacity = '1';
            menuToggle.querySelector('span:nth-child(3)').style.transform = 'none';
        }
    };

    // Close menu when clicking a nav link
    const handleNavLinkClick = () => {
        const navLinks = document.querySelector('.nav-links');
        const menuToggle = document.querySelector('.menu-toggle');
        const navbar = document.querySelector('.navbar');

        if (!navLinks || !menuToggle || !navbar) return;

        if (window.innerWidth <= 768 && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
            navbar.classList.remove('mobile-active');
            menuToggle.querySelector('span:nth-child(1)').style.transform = 'none';
            menuToggle.querySelector('span:nth-child(2)').style.opacity = '1';
            menuToggle.querySelector('span:nth-child(3)').style.transform = 'none';
        }
    };

    // Add event listeners to nav links
    const addNavLinkListeners = () => {
        const links = document.querySelectorAll('.nav-links a');
        links.forEach(link => {
            link.addEventListener('click', handleNavLinkClick);
        });
    };

    // Handle notification bell
    const setupNotificationBell = () => {
        const notificationBell = document.getElementById('notification-bell');
        const notificationDropdown = document.querySelector('.notification-dropdown');

        if (notificationBell && notificationDropdown) {
            notificationBell.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                notificationDropdown.classList.toggle('show');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (notificationDropdown.classList.contains('show') &&
                    !notificationDropdown.contains(e.target) &&
                    !notificationBell.contains(e.target)) {
                    notificationDropdown.classList.remove('show');
                }
            });
        }
    };

    // Add scroll event to handle navbar effects
    const handleScroll = () => {
        const navbar = document.querySelector('.navbar');

        if (navbar) {
            // Keep navbar transparent regardless of scroll position
            navbar.style.backgroundColor = 'transparent';
            navbar.style.boxShadow = 'none';
        }
    };

    // Initialize
    handleResize();
    addNavLinkListeners();
    setupNotificationBell();

    // Event listeners
    window.addEventListener('resize', handleResize);
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScroll);
});
