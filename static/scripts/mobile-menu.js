document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navbar = document.querySelector('.navbar');

    if (menuToggle && navLinks) {
        // Toggle menu when clicking the hamburger icon
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent document click from immediately closing it

            // Toggle active classes
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');

            // Add mobile-active class to navbar for styling
            if (navLinks.classList.contains('active')) {
                navbar.classList.add('mobile-active');

                // Prevent body scrolling when menu is open
                document.body.style.overflow = 'hidden';

                // Add animation classes to nav links
                animateNavLinks();
            } else {
                navbar.classList.remove('mobile-active');
                document.body.style.overflow = '';
            }
        });
    }

    // Animate nav links with staggered delay
    function animateNavLinks() {
        const links = document.querySelectorAll('.nav-links li');
        links.forEach((link, index) => {
            // Reset any existing animations
            link.style.animation = '';

            // Add animation with staggered delay
            setTimeout(() => {
                link.style.opacity = '0';
                link.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.1}s`;
            }, 10);
        });
    }

    // Add fadeInUp animation keyframes if not already in CSS
    if (!document.querySelector('#mobile-menu-animations')) {
        const style = document.createElement('style');
        style.id = 'mobile-menu-animations';
        style.textContent = `
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .nav-links.active li {
                opacity: 0;
            }
        `;
        document.head.appendChild(style);
    }

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (navLinks && navLinks.classList.contains('active') &&
            !event.target.closest('.navbar')) {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            navbar.classList.remove('mobile-active');
            document.body.style.overflow = '';
        }
    });

    // Close menu when clicking on a link
    const navLinkItems = document.querySelectorAll('.nav-links a');
    navLinkItems.forEach(link => {
        link.addEventListener('click', function() {
            if (menuToggle && menuToggle.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                navbar.classList.remove('mobile-active');
                document.body.style.overflow = '';
            }
        });
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navLinks && navLinks.classList.contains('active')) {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            navbar.classList.remove('mobile-active');
            document.body.style.overflow = '';
        }
    });
});
