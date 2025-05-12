/**
 * LARO-Hub Navigation Script
 * Handles the navigation functionality for all pages
 */

document.addEventListener('DOMContentLoaded', function() {
    // Handle header scroll effect
    const header = document.querySelector('header');
    const scrollThreshold = 50;

    function handleScroll() {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    // Initial check
    handleScroll();
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const authButtons = document.querySelector('.auth-buttons');

    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            authButtons.classList.toggle('active');
            
            // Toggle hamburger animation
            if (menuToggle.classList.contains('active')) {
                menuToggle.querySelector('span:nth-child(1)').style.transform = 'rotate(45deg) translate(5px, 5px)';
                menuToggle.querySelector('span:nth-child(2)').style.opacity = '0';
                menuToggle.querySelector('span:nth-child(3)').style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                menuToggle.querySelector('span:nth-child(1)').style.transform = 'none';
                menuToggle.querySelector('span:nth-child(2)').style.opacity = '1';
                menuToggle.querySelector('span:nth-child(3)').style.transform = 'none';
            }
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideMenu = navLinks.contains(event.target) || 
                                 authButtons.contains(event.target) || 
                                 menuToggle.contains(event.target);
        
        if (!isClickInsideMenu && navLinks.classList.contains('active')) {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            authButtons.classList.remove('active');
            
            // Reset hamburger
            menuToggle.querySelector('span:nth-child(1)').style.transform = 'none';
            menuToggle.querySelector('span:nth-child(2)').style.opacity = '1';
            menuToggle.querySelector('span:nth-child(3)').style.transform = 'none';
        }
    });

    // Handle notification bell on mobile
    const notificationBell = document.querySelector('.notification-bell');
    const notificationDropdown = document.querySelector('.notification-dropdown');

    if (notificationBell && window.innerWidth <= 768) {
        notificationBell.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationDropdown.style.display = notificationDropdown.style.display === 'block' ? 'none' : 'block';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!notificationDropdown.contains(e.target) && !notificationBell.contains(e.target)) {
                notificationDropdown.style.display = 'none';
            }
        });
    }

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            // Reset mobile menu
            if (navLinks.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                authButtons.classList.remove('active');
                
                // Reset hamburger
                menuToggle.querySelector('span:nth-child(1)').style.transform = 'none';
                menuToggle.querySelector('span:nth-child(2)').style.opacity = '1';
                menuToggle.querySelector('span:nth-child(3)').style.transform = 'none';
            }
            
            // Reset notification dropdown
            if (notificationDropdown) {
                notificationDropdown.style.display = '';
            }
        } else {
            // Handle notification bell differently on mobile
            if (notificationBell) {
                notificationBell.removeEventListener('click', () => {});
                notificationBell.addEventListener('click', function(e) {
                    e.stopPropagation();
                    notificationDropdown.style.display = notificationDropdown.style.display === 'block' ? 'none' : 'block';
                });
            }
        }
    });

    // Mark all notifications as read
    const markAllRead = document.querySelector('.mark-all-read');
    if (markAllRead) {
        markAllRead.addEventListener('click', function() {
            const unreadItems = document.querySelectorAll('.notification-item.unread');
            unreadItems.forEach(item => {
                item.classList.remove('unread');
            });
            
            // Update badge count
            const badge = document.querySelector('.notification-badge');
            if (badge) {
                badge.textContent = '0';
            }
        });
    }
});
