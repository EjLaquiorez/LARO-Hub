/**
 * Notification Service
 * Handles notification functionality across the application
 */

// Store notifications in localStorage to persist between page refreshes
const NOTIFICATION_STORAGE_KEY = 'laro_notifications';
const NOTIFICATION_COUNT_KEY = 'laro_notification_count';

/**
 * Notification Service Class
 */
class NotificationService {
    constructor() {
        this.notifications = [];
        this.listeners = [];
        this.loadNotifications();
    }

    /**
     * Load notifications from localStorage
     */
    loadNotifications() {
        const storedNotifications = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
        if (storedNotifications) {
            try {
                this.notifications = JSON.parse(storedNotifications);
            } catch (error) {
                console.error('Error parsing stored notifications:', error);
                this.notifications = [];
            }
        } else {
            // Initialize with sample notifications if none exist
            this.initializeSampleNotifications();
        }
    }

    /**
     * Initialize with sample notifications
     */
    initializeSampleNotifications() {
        const currentTime = new Date();
        
        this.notifications = [
            {
                id: 1,
                type: 'login',
                content: 'You approved a login.',
                timestamp: new Date(currentTime - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
                read: false,
                avatar: '/static/img/avatar1.jpg'
            },
            {
                id: 2,
                type: 'game',
                content: 'Your last game got 22 views before it expired. You can create a new game.',
                timestamp: new Date(currentTime - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
                read: true,
                avatar: '/static/img/laro-icon.png'
            },
            {
                id: 3,
                type: 'login',
                content: 'You approved a login.',
                timestamp: new Date(currentTime - 21 * 60 * 60 * 1000).toISOString(), // 21 hours ago
                read: false,
                avatar: '/static/img/avatar2.jpg'
            },
            {
                id: 4,
                type: 'login',
                content: 'You approved a login.',
                timestamp: new Date(currentTime - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
                read: false,
                avatar: '/static/img/avatar3.jpg'
            },
            {
                id: 5,
                type: 'alert',
                content: 'Reminder: The files you requested are only available to download for 24 more hours.',
                timestamp: new Date(currentTime - 25 * 60 * 60 * 1000).toISOString(), // 1 day ago
                read: false,
                isAlert: true
            }
        ];
        
        this.saveNotifications();
    }

    /**
     * Save notifications to localStorage
     */
    saveNotifications() {
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(this.notifications));
        this.updateUnreadCount();
        this.notifyListeners();
    }

    /**
     * Update unread notification count
     */
    updateUnreadCount() {
        const unreadCount = this.getUnreadCount();
        localStorage.setItem(NOTIFICATION_COUNT_KEY, unreadCount.toString());
        return unreadCount;
    }

    /**
     * Get all notifications
     * @returns {Array} Array of notification objects
     */
    getNotifications() {
        return [...this.notifications];
    }

    /**
     * Get unread notifications
     * @returns {Array} Array of unread notification objects
     */
    getUnreadNotifications() {
        return this.notifications.filter(notification => !notification.read);
    }

    /**
     * Get unread notification count
     * @returns {number} Number of unread notifications
     */
    getUnreadCount() {
        return this.getUnreadNotifications().length;
    }

    /**
     * Add a new notification
     * @param {Object} notification Notification object
     */
    addNotification(notification) {
        const newNotification = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
        };
        
        this.notifications.unshift(newNotification);
        this.saveNotifications();
        return newNotification;
    }

    /**
     * Mark a notification as read
     * @param {number} id Notification ID
     */
    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
        }
    }

    /**
     * Mark all notifications as read
     */
    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.saveNotifications();
    }

    /**
     * Delete a notification
     * @param {number} id Notification ID
     */
    deleteNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.saveNotifications();
    }

    /**
     * Clear all notifications
     */
    clearNotifications() {
        this.notifications = [];
        this.saveNotifications();
    }

    /**
     * Add a listener for notification changes
     * @param {Function} listener Callback function
     */
    addListener(listener) {
        this.listeners.push(listener);
    }

    /**
     * Remove a listener
     * @param {Function} listener Callback function to remove
     */
    removeListener(listener) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    /**
     * Notify all listeners of changes
     */
    notifyListeners() {
        this.listeners.forEach(listener => {
            try {
                listener(this.notifications);
            } catch (error) {
                console.error('Error in notification listener:', error);
            }
        });
    }
}

// Create a singleton instance
const notificationService = new NotificationService();

// Export the singleton
window.notificationService = notificationService;
