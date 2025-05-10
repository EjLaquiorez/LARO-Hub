/**
 * LARO-Hub Notification System
 * A lightweight notification system for displaying alerts and messages
 */

class NotificationSystem {
    constructor(options = {}) {
        // Default options
        this.options = {
            position: options.position || 'top-right',
            maxNotifications: options.maxNotifications || 5,
            duration: options.duration || 5000,
            animationDuration: options.animationDuration || 300,
            containerClass: options.containerClass || '',
            pauseOnHover: options.pauseOnHover !== undefined ? options.pauseOnHover : true,
            showProgressBar: options.showProgressBar !== undefined ? options.showProgressBar : true,
            showCloseButton: options.showCloseButton !== undefined ? options.showCloseButton : true,
            newestOnTop: options.newestOnTop !== undefined ? options.newestOnTop : true
        };

        // Create container
        this.createContainer();
        
        // Active notifications
        this.notifications = [];
        
        // Queue for notifications when max is reached
        this.queue = [];
    }

    /**
     * Create the notification container
     */
    createContainer() {
        // Check if container already exists
        const existingContainer = document.querySelector(`.notification-container.notification-${this.options.position}`);
        if (existingContainer) {
            this.container = existingContainer;
            return;
        }

        // Create new container
        this.container = document.createElement('div');
        this.container.className = `notification-container notification-${this.options.position} ${this.options.containerClass}`;
        document.body.appendChild(this.container);
    }

    /**
     * Show a notification
     * @param {Object} options - Notification options
     * @param {string} options.type - Notification type (success, error, warning, info, laro)
     * @param {string} options.title - Notification title
     * @param {string} options.message - Notification message
     * @param {string} options.icon - HTML for the icon
     * @param {number} options.duration - Duration in ms (0 for no auto-dismiss)
     * @param {boolean} options.showProgressBar - Whether to show progress bar
     * @param {boolean} options.showCloseButton - Whether to show close button
     * @param {Function} options.onClick - Click callback
     * @param {Function} options.onClose - Close callback
     * @param {string} options.buttonText - Text for action button (if any)
     * @param {Function} options.buttonCallback - Callback for action button
     */
    show(options) {
        const notificationOptions = {
            type: options.type || 'info',
            title: options.title || '',
            message: options.message || '',
            icon: options.icon || this.getDefaultIcon(options.type || 'info'),
            duration: options.duration !== undefined ? options.duration : this.options.duration,
            showProgressBar: options.showProgressBar !== undefined ? options.showProgressBar : this.options.showProgressBar,
            showCloseButton: options.showCloseButton !== undefined ? options.showCloseButton : this.options.showCloseButton,
            onClick: options.onClick || null,
            onClose: options.onClose || null,
            buttonText: options.buttonText || '',
            buttonCallback: options.buttonCallback || null
        };

        // Check if max notifications reached
        if (this.notifications.length >= this.options.maxNotifications) {
            this.queue.push(notificationOptions);
            return;
        }

        // Create notification element
        const notification = this.createNotificationElement(notificationOptions);
        
        // Add to DOM
        if (this.options.newestOnTop) {
            this.container.prepend(notification.element);
        } else {
            this.container.appendChild(notification.element);
        }
        
        // Add to active notifications
        this.notifications.push(notification);
        
        // Auto dismiss
        if (notificationOptions.duration > 0) {
            notification.timeout = setTimeout(() => {
                this.close(notification.id);
            }, notificationOptions.duration);
        }
        
        // Return notification ID
        return notification.id;
    }

    /**
     * Create notification element
     * @param {Object} options - Notification options
     * @returns {Object} Notification object with element and ID
     */
    createNotificationElement(options) {
        const id = Date.now().toString();
        
        // Create main element
        const element = document.createElement('div');
        element.className = `notification notification-${options.type}`;
        element.setAttribute('data-notification-id', id);
        
        // Add click handler
        if (options.onClick) {
            element.style.cursor = 'pointer';
            element.addEventListener('click', (e) => {
                if (e.target.closest('.notification-close') || e.target.closest('.notification-btn')) {
                    return;
                }
                options.onClick();
            });
        }
        
        // Create content
        let html = `
            <div class="notification-icon">${options.icon}</div>
            <div class="notification-content">
                ${options.title ? `<div class="notification-title">${options.title}</div>` : ''}
                ${options.message ? `<p class="notification-message">${options.message}</p>` : ''}
                ${options.buttonText ? `<button class="notification-btn">${options.buttonText}</button>` : ''}
            </div>
        `;
        
        // Add close button
        if (options.showCloseButton) {
            html += `<button class="notification-close">&times;</button>`;
        }
        
        // Add progress bar
        if (options.showProgressBar && options.duration > 0) {
            html += `
                <div class="notification-progress">
                    <div class="notification-progress-bar" style="animation-duration: ${options.duration}ms"></div>
                </div>
            `;
        }
        
        element.innerHTML = html;
        
        // Add button event listener
        if (options.buttonText && options.buttonCallback) {
            const button = element.querySelector('.notification-btn');
            button.addEventListener('click', options.buttonCallback);
        }
        
        // Add close button event listener
        if (options.showCloseButton) {
            const closeButton = element.querySelector('.notification-close');
            closeButton.addEventListener('click', () => this.close(id));
        }
        
        // Add hover pause
        if (this.options.pauseOnHover && options.duration > 0) {
            let remaining = options.duration;
            let paused = false;
            let startTime;
            
            element.addEventListener('mouseenter', () => {
                if (paused) return;
                
                clearTimeout(notification.timeout);
                
                if (options.showProgressBar) {
                    const progressBar = element.querySelector('.notification-progress-bar');
                    const computedStyle = window.getComputedStyle(progressBar);
                    const width = parseFloat(computedStyle.width) / parseFloat(computedStyle.width) * 100;
                    remaining = (options.duration * width) / 100;
                    
                    progressBar.style.animationPlayState = 'paused';
                }
                
                paused = true;
            });
            
            element.addEventListener('mouseleave', () => {
                if (!paused) return;
                
                notification.timeout = setTimeout(() => {
                    this.close(id);
                }, remaining);
                
                if (options.showProgressBar) {
                    const progressBar = element.querySelector('.notification-progress-bar');
                    progressBar.style.animationDuration = `${remaining}ms`;
                    progressBar.style.animationPlayState = 'running';
                }
                
                paused = false;
            });
        }
        
        // Create notification object
        const notification = {
            id,
            element,
            options,
            timeout: null
        };
        
        return notification;
    }

    /**
     * Close a notification
     * @param {string} id - Notification ID
     */
    close(id) {
        // Find notification
        const index = this.notifications.findIndex(n => n.id === id);
        if (index === -1) return;
        
        const notification = this.notifications[index];
        
        // Clear timeout
        if (notification.timeout) {
            clearTimeout(notification.timeout);
        }
        
        // Add closing class
        notification.element.classList.add('closing');
        
        // Remove after animation
        setTimeout(() => {
            // Remove from DOM
            notification.element.remove();
            
            // Remove from active notifications
            this.notifications.splice(index, 1);
            
            // Call onClose callback
            if (notification.options.onClose) {
                notification.options.onClose();
            }
            
            // Process queue
            this.processQueue();
        }, this.options.animationDuration);
    }

    /**
     * Process the notification queue
     */
    processQueue() {
        if (this.queue.length === 0) return;
        if (this.notifications.length >= this.options.maxNotifications) return;
        
        // Get next notification from queue
        const options = this.queue.shift();
        
        // Show notification
        this.show(options);
    }

    /**
     * Close all notifications
     */
    closeAll() {
        // Clone the notifications array to avoid issues during iteration
        const notificationsToClose = [...this.notifications];
        
        // Close each notification
        notificationsToClose.forEach(notification => {
            this.close(notification.id);
        });
        
        // Clear queue
        this.queue = [];
    }

    /**
     * Get default icon based on notification type
     * @param {string} type - Notification type
     * @returns {string} HTML for the icon
     */
    getDefaultIcon(type) {
        switch (type) {
            case 'success':
                return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
            case 'error':
                return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
            case 'warning':
                return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
            case 'laro':
                return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>';
            case 'info':
            default:
                return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
        }
    }

    // Shorthand methods
    success(options) {
        return this.show({ ...options, type: 'success' });
    }

    error(options) {
        return this.show({ ...options, type: 'error' });
    }

    warning(options) {
        return this.show({ ...options, type: 'warning' });
    }

    info(options) {
        return this.show({ ...options, type: 'info' });
    }

    laro(options) {
        return this.show({ ...options, type: 'laro' });
    }
}

// Create global instance
window.notifications = new NotificationSystem();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystem;
}
