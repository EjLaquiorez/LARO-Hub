/**
 * LARO-Hub Global Notification Component
 * 
 * This file provides a reusable notification component that can be included on all pages.
 * It handles:
 * - Displaying the notification bell with badge
 * - Showing the notification dropdown
 * - Marking notifications as read
 * - Updating notification counts in real-time
 */

class NotificationComponent {
    constructor(options = {}) {
        // Default options
        this.options = {
            bellSelector: '#notification-bell',
            dropdownSelector: '.notification-dropdown',
            badgeSelector: '.notification-badge',
            listSelector: '.notification-list',
            markAllReadSelector: '.see-previous',
            ...options
        };
        
        // Elements
        this.bellElement = null;
        this.dropdownElement = null;
        this.badgeElement = null;
        this.listElement = null;
        this.markAllReadElement = null;
        
        // State
        this.isInitialized = false;
        this.isDropdownOpen = false;
        
        // Initialize when document is ready
        if (document.readyState === 'complete') {
            this.initialize();
        } else {
            window.addEventListener('load', () => this.initialize());
        }
    }
    
    /**
     * Initialize the component
     */
    initialize() {
        if (this.isInitialized) return;
        
        // Get elements
        this.bellElement = document.querySelector(this.options.bellSelector);
        this.dropdownElement = document.querySelector(this.options.dropdownSelector);
        this.badgeElement = document.querySelector(this.options.badgeSelector);
        this.listElement = document.querySelector(this.options.listSelector);
        this.markAllReadElement = document.querySelector(this.options.markAllReadSelector);
        
        // Check if elements exist
        if (!this.bellElement || !this.dropdownElement || !this.badgeElement || !this.listElement) {
            console.error('Notification component elements not found');
            return;
        }
        
        // Add event listeners
        this.addEventListeners();
        
        // Add notification service listener
        if (window.notificationService) {
            window.notificationService.addListener(() => this.updateNotifications());
        } else {
            console.error('Notification service not available');
        }
        
        // Initial update
        this.updateNotifications();
        
        this.isInitialized = true;
    }
    
    /**
     * Add event listeners
     */
    addEventListeners() {
        // Toggle dropdown when clicking the bell
        this.bellElement.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleDropdown();
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isDropdownOpen && 
                !this.dropdownElement.contains(e.target) && 
                !this.bellElement.contains(e.target)) {
                this.closeDropdown();
            }
        });
        
        // Mark all as read button
        if (this.markAllReadElement) {
            this.markAllReadElement.addEventListener('click', (e) => {
                e.preventDefault();
                this.markAllAsRead();
            });
        }
        
        // Filter buttons
        const filterButtons = this.dropdownElement.querySelectorAll('.notification-option');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Get filter type
                const filterType = button.textContent.trim().toLowerCase();
                
                // Update notifications with filter
                this.renderNotifications(filterType);
            });
        });
    }
    
    /**
     * Toggle dropdown visibility
     */
    toggleDropdown() {
        if (this.isDropdownOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }
    
    /**
     * Open dropdown
     */
    openDropdown() {
        this.dropdownElement.classList.add('show');
        this.isDropdownOpen = true;
        this.renderNotifications();
    }
    
    /**
     * Close dropdown
     */
    closeDropdown() {
        this.dropdownElement.classList.remove('show');
        this.isDropdownOpen = false;
    }
    
    /**
     * Update notifications
     */
    updateNotifications() {
        if (!window.notificationService) return;
        
        // Update badge count
        const unreadCount = window.notificationService.getUnreadCount();
        this.updateBadge(unreadCount);
        
        // Update dropdown if open
        if (this.isDropdownOpen) {
            this.renderNotifications();
        }
    }
    
    /**
     * Update notification badge
     * @param {number} count - Unread notification count
     */
    updateBadge(count) {
        if (!this.badgeElement) return;
        
        if (count > 0) {
            this.badgeElement.textContent = count > 9 ? '9+' : count;
            this.badgeElement.style.display = 'flex';
        } else {
            this.badgeElement.style.display = 'none';
        }
    }
    
    /**
     * Render notifications in the dropdown
     * @param {string} filter - Filter type (all, unread)
     */
    renderNotifications(filter = 'all') {
        if (!window.notificationService || !this.listElement) return;
        
        // Clear existing notifications
        this.listElement.innerHTML = '';
        
        // Get notifications
        let notifications = window.notificationService.getNotifications();
        
        // Apply filter
        if (filter === 'unread') {
            notifications = notifications.filter(n => !n.is_read);
        }
        
        // Check if there are notifications
        if (notifications.length === 0) {
            this.listElement.innerHTML = `
                <div class="no-notifications">
                    <p>No notifications to display</p>
                </div>
            `;
            return;
        }
        
        // Create notification items
        notifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = `notification-item${notification.is_read ? '' : ' unread'}`;
            notificationItem.dataset.id = notification.id;
            
            // Get avatar based on notification type
            const avatarUrl = window.notificationService.getAvatarForType(notification.type);
            const isAlert = window.notificationService.isAlertType(notification.type);
            
            // Create avatar element
            let avatarHtml = '';
            if (isAlert) {
                avatarHtml = `
                    <div class="notification-avatar alert-icon">
                        <i class="bi bi-exclamation-triangle-fill"></i>
                    </div>
                `;
            } else {
                avatarHtml = `
                    <div class="notification-avatar">
                        <img src="${avatarUrl}" alt="Avatar">
                    </div>
                `;
            }
            
            // Create content
            notificationItem.innerHTML = `
                ${avatarHtml}
                <div class="notification-content">
                    <p>${notification.content}</p>
                    <span class="notification-time">${notification.formatted_timestamp || this.formatTimestamp(notification.created_at)}</span>
                </div>
                ${!notification.is_read ? '<div class="notification-status"><span class="status-dot"></span></div>' : ''}
            `;
            
            // Add click event to mark as read
            notificationItem.addEventListener('click', () => {
                this.markAsRead(notification.id);
            });
            
            this.listElement.appendChild(notificationItem);
        });
    }
    
    /**
     * Format timestamp to relative time
     * @param {string} timestamp - ISO timestamp
     * @returns {string} Formatted timestamp
     */
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        
        if (diffDay > 0) {
            return diffDay === 1 ? '1d' : `${diffDay}d`;
        } else if (diffHour > 0) {
            return `${diffHour}h`;
        } else if (diffMin > 0) {
            return `${diffMin}m`;
        } else {
            return 'Just now';
        }
    }
    
    /**
     * Mark a notification as read
     * @param {number} id - Notification ID
     */
    async markAsRead(id) {
        if (!window.notificationService) return;
        
        await window.notificationService.markAsRead(id);
        this.updateNotifications();
    }
    
    /**
     * Mark all notifications as read
     */
    async markAllAsRead() {
        if (!window.notificationService) return;
        
        await window.notificationService.markAllAsRead();
        this.updateNotifications();
    }
}

// Create global instance
window.notificationComponent = new NotificationComponent();
