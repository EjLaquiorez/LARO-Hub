/**
 * LARO-Hub Responsive Profile Navigation
 * Handles the responsive navigation menu for the profile page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Ensure body is scrollable
    document.body.style.overflowY = 'auto';
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
        navbar.insertBefore(menuToggle, navbar.firstChild);

        // Add event listener
        menuToggle.addEventListener('click', toggleMobileMenu);
    };

    // Toggle mobile menu
    const toggleMobileMenu = () => {
        const navLinks = document.querySelector('.nav-links');
        const menuToggle = document.querySelector('.menu-toggle');
        const navbar = document.querySelector('.navbar');

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

    // Handle profile card layout on mobile
    const handleProfileCardLayout = () => {
        const profileCard = document.querySelector('.profile-card');

        if (window.innerWidth <= 768) {
            // Check if already in column layout
            if (profileCard.style.flexDirection !== 'column') {
                profileCard.style.flexDirection = 'column';

                const leftPanel = profileCard.querySelector('.left-panel');
                const rightPanel = profileCard.querySelector('.right-panel');

                // Adjust height for mobile layout
                leftPanel.style.height = 'auto';
                rightPanel.style.height = 'auto';
            }
        } else {
            // Reset to row layout on larger screens
            profileCard.style.flexDirection = '';

            const leftPanel = profileCard.querySelector('.left-panel');
            const rightPanel = profileCard.querySelector('.right-panel');

            // Reset height for desktop layout
            leftPanel.style.height = '';
            rightPanel.style.height = '';
        }
    };

    // Initialize
    handleResize();
    addNavLinkListeners();
    handleProfileCardLayout();

    // Event listeners
    window.addEventListener('resize', () => {
        handleResize();
        handleProfileCardLayout();
    });
    document.addEventListener('click', handleClickOutside);
});
