/**
 * Notification Service
 * Handles notification functionality across the application
 *
 * Features:
 * - Fetches notifications from the backend API
 * - Caches notifications in localStorage for offline access
 * - Provides methods to mark notifications as read
 * - Supports real-time updates through polling
 * - Notifies listeners of changes
 */

// Store notifications in localStorage to persist between page refreshes
const NOTIFICATION_STORAGE_KEY = 'laro_notifications';
const NOTIFICATION_COUNT_KEY = 'laro_notification_count';
const NOTIFICATION_LAST_FETCH_KEY = 'laro_notification_last_fetch';

// API endpoints
const API_BASE_URL = '/api';
const NOTIFICATIONS_ENDPOINT = `${API_BASE_URL}/notifications/`;
const MARK_ALL_READ_ENDPOINT = `${API_BASE_URL}/notifications/mark-all-read/`;
const UNREAD_COUNT_ENDPOINT = `${API_BASE_URL}/notifications/unread-count/`;

// Polling interval in milliseconds (10 seconds)
const POLLING_INTERVAL = 10000;

/**
 * Notification Service Class
 */
class NotificationService {
    constructor() {
        this.notifications = [];
        this.listeners = [];
        this.isInitialized = false;
        this.pollingInterval = null;
        this.lastFetchTime = null;

        // Load cached notifications immediately
        this.loadCachedNotifications();

        // Initialize when document is ready
        if (document.readyState === 'complete') {
            this.initialize();
        } else {
            window.addEventListener('load', () => this.initialize());
        }
    }

    /**
     * Initialize the service
     */
    async initialize() {
        if (this.isInitialized) return;

        // Check if user is logged in
        const token = this.getAuthToken();
        if (!token) {
            console.log('User not logged in, notification service not initialized');
            return;
        }

        // Fetch notifications from API
        await this.fetchNotifications();

        // Start polling for new notifications
        this.startPolling();

        this.isInitialized = true;
    }

    /**
     * Get authentication token
     * @returns {string|null} JWT token or null if not logged in
     */
    getAuthToken() {
        return localStorage.getItem('access');
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} True if user is authenticated
     */
    isAuthenticated() {
        return !!this.getAuthToken();
    }

    /**
     * Load cached notifications from localStorage
     */
    loadCachedNotifications() {
        const storedNotifications = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
        if (storedNotifications) {
            try {
                this.notifications = JSON.parse(storedNotifications);
                this.lastFetchTime = localStorage.getItem(NOTIFICATION_LAST_FETCH_KEY);
                this.notifyListeners();
            } catch (error) {
                console.error('Error parsing stored notifications:', error);
                this.notifications = [];
            }
        }
    }

    /**
     * Save notifications to localStorage
     */
    saveNotifications() {
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(this.notifications));
        localStorage.setItem(NOTIFICATION_LAST_FETCH_KEY, this.lastFetchTime || new Date().toISOString());
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
        return this.notifications.filter(notification => !notification.is_read);
    }

    /**
     * Get unread notification count
     * @returns {number} Number of unread notifications
     */
    getUnreadCount() {
        return this.getUnreadNotifications().length;
    }

    /**
     * Fetch notifications from the API
     * @param {boolean} unreadOnly - Whether to fetch only unread notifications
     * @returns {Promise<Array>} Promise resolving to array of notifications
     */
    async fetchNotifications(unreadOnly = false) {
        if (!this.isAuthenticated()) {
            console.log('User not authenticated, cannot fetch notifications');
            return this.notifications;
        }

        try {
            const token = this.getAuthToken();
            const url = `${NOTIFICATIONS_ENDPOINT}${unreadOnly ? '?unread_only=true' : ''}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch notifications: ${response.status}`);
            }

            const data = await response.json();
            this.notifications = data;
            this.lastFetchTime = new Date().toISOString();
            this.saveNotifications();

            return data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return this.notifications;
        }
    }

    /**
     * Fetch unread notification count from the API
     * @returns {Promise<number>} Promise resolving to unread count
     */
    async fetchUnreadCount() {
        if (!this.isAuthenticated()) {
            return this.getUnreadCount();
        }

        try {
            const token = this.getAuthToken();

            const response = await fetch(UNREAD_COUNT_ENDPOINT, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch unread count: ${response.status}`);
            }

            const data = await response.json();
            return data.count;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            return this.getUnreadCount();
        }
    }

    /**
     * Add a new notification (client-side only)
     * @param {Object} notification Notification object
     * @returns {Object} The new notification
     */
    addNotification(notification) {
        const newNotification = {
            id: Date.now(),
            created_at: new Date().toISOString(),
            is_read: false,
            ...notification
        };

        this.notifications.unshift(newNotification);
        this.saveNotifications();
        return newNotification;
    }

    /**
     * Mark a notification as read
     * @param {number} id Notification ID
     * @returns {Promise<boolean>} Promise resolving to success status
     */
    async markAsRead(id) {
        if (!this.isAuthenticated()) {
            // Offline mode - update locally
            const notification = this.notifications.find(n => n.id === id);
            if (notification) {
                notification.is_read = true;
                this.saveNotifications();
            }
            return true;
        }

        try {
            const token = this.getAuthToken();

            const response = await fetch(`${NOTIFICATIONS_ENDPOINT}${id}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_read: true })
            });

            if (!response.ok) {
                throw new Error(`Failed to mark notification as read: ${response.status}`);
            }

            // Update local cache
            const notification = this.notifications.find(n => n.id === id);
            if (notification) {
                notification.is_read = true;
                this.saveNotifications();
            }

            return true;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }
    }

    /**
     * Mark all notifications as read
     * @returns {Promise<boolean>} Promise resolving to success status
     */
    async markAllAsRead() {
        if (!this.isAuthenticated()) {
            // Offline mode - update locally
            this.notifications.forEach(notification => {
                notification.is_read = true;
            });
            this.saveNotifications();
            return true;
        }

        try {
            const token = this.getAuthToken();

            const response = await fetch(MARK_ALL_READ_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to mark all notifications as read: ${response.status}`);
            }

            // Update local cache
            this.notifications.forEach(notification => {
                notification.is_read = true;
            });
            this.saveNotifications();

            return true;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return false;
        }
    }

    /**
     * Delete a notification
     * @param {number} id Notification ID
     * @returns {Promise<boolean>} Promise resolving to success status
     */
    async deleteNotification(id) {
        if (!this.isAuthenticated()) {
            // Offline mode - update locally
            this.notifications = this.notifications.filter(n => n.id !== id);
            this.saveNotifications();
            return true;
        }

        try {
            const token = this.getAuthToken();

            const response = await fetch(`${NOTIFICATIONS_ENDPOINT}${id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to delete notification: ${response.status}`);
            }

            // Update local cache
            this.notifications = this.notifications.filter(n => n.id !== id);
            this.saveNotifications();

            return true;
        } catch (error) {
            console.error('Error deleting notification:', error);
            return false;
        }
    }

    /**
     * Start polling for new notifications
     */
    startPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }

        this.pollingInterval = setInterval(async () => {
            if (this.isAuthenticated()) {
                await this.fetchNotifications();
            } else {
                this.stopPolling();
            }
        }, POLLING_INTERVAL);
    }

    /**
     * Stop polling for new notifications
     */
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    /**
     * Add a listener for notification changes
     * @param {Function} listener Callback function
     */
    addListener(listener) {
        this.listeners.push(listener);

        // Call the listener immediately with current notifications
        try {
            listener(this.notifications);
        } catch (error) {
            console.error('Error in notification listener:', error);
        }
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

    /**
     * Get avatar URL for a notification type
     * @param {string} type Notification type
     * @returns {string} Avatar URL
     */
    getAvatarForType(type) {
        switch (type) {
            case 'message':
                return '/static/img/avatar1.jpg';
            case 'game_invitation':
                return '/static/img/avatar2.jpg';
            case 'game_update':
                return '/static/img/avatar3.jpg';
            case 'system':
                return '/static/img/laro-icon.png';
            default:
                return '/static/img/laro-icon.png';
        }
    }

    /**
     * Check if notification is an alert type
     * @param {string} type Notification type
     * @returns {boolean} True if alert type
     */
    isAlertType(type) {
        return type === 'system';
    }

    /**
     * Clear all notifications
     * @returns {Promise<boolean>} Promise resolving to success status
     */
    async clearNotifications() {
        if (!this.isAuthenticated()) {
            // Offline mode - clear locally
            this.notifications = [];
            this.saveNotifications();
            return true;
        }

        try {
            const token = this.getAuthToken();

            // First mark all as read
            await this.markAllAsRead();

            // Then delete all notifications one by one
            // Note: In a real implementation, we would have a bulk delete endpoint
            const deletePromises = this.notifications.map(notification =>
                this.deleteNotification(notification.id)
            );

            await Promise.all(deletePromises);

            // Clear local cache
            this.notifications = [];
            this.saveNotifications();

            return true;
        } catch (error) {
            console.error('Error clearing notifications:', error);
            return false;
        }
    }
}

// Create a singleton instance
const notificationService = new NotificationService();

// Export the singleton
window.notificationService = notificationService;
