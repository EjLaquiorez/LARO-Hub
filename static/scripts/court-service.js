/**
 * Court Service for LARO-Hub
 * Handles court-related functionality including fetching and managing courts
 */

import apiService from './api-service.js';
import authService from './auth-service.js';

class CourtService {
    /**
     * Get all courts with optional search
     * @param {string} searchQuery - Optional search query
     * @returns {Promise<Array>} List of courts
     */
    async getCourts(searchQuery = '') {
        try {
            const endpoint = searchQuery 
                ? `/api/courts/?search=${encodeURIComponent(searchQuery)}` 
                : '/api/courts/';
            
            const response = await authService.apiRequest(endpoint);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch courts: ${response.status}`);
            }
            
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error('Error fetching courts:', error);
            throw error;
        }
    }

    /**
     * Get court details by ID
     * @param {number} courtId - Court ID
     * @returns {Promise<object>} Court details
     */
    async getCourtById(courtId) {
        try {
            const response = await authService.apiRequest(`/api/courts/${courtId}/`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch court ${courtId}: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error fetching court ${courtId}:`, error);
            throw error;
        }
    }

    /**
     * Create a new court
     * @param {object} courtData - Court data
     * @returns {Promise<object>} Created court
     */
    async createCourt(courtData) {
        try {
            const response = await authService.apiRequest('/api/courts/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(courtData),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to create court: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error creating court:', error);
            throw error;
        }
    }

    /**
     * Update a court
     * @param {number} courtId - Court ID
     * @param {object} courtData - Updated court data
     * @returns {Promise<object>} Updated court
     */
    async updateCourt(courtId, courtData) {
        try {
            const response = await authService.apiRequest(`/api/courts/${courtId}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(courtData),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to update court: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error updating court ${courtId}:`, error);
            throw error;
        }
    }

    /**
     * Delete a court
     * @param {number} courtId - Court ID
     * @returns {Promise<void>}
     */
    async deleteCourt(courtId) {
        try {
            const response = await authService.apiRequest(`/api/courts/${courtId}/`, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to delete court: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error deleting court ${courtId}:`, error);
            throw error;
        }
    }

    /**
     * Get courts owned by the current user
     * @returns {Promise<Array>} List of courts
     */
    async getMyCourts() {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            throw new Error('User not authenticated');
        }

        try {
            const endpoint = `/api/courts/?owner=${currentUser.id}`;
            const response = await authService.apiRequest(endpoint);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch owned courts: ${response.status}`);
            }
            
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error('Error fetching owned courts:', error);
            throw error;
        }
    }

    /**
     * Format court address for display
     * @param {object} court - Court object
     * @returns {string} Formatted address
     */
    formatCourtAddress(court) {
        if (!court || !court.location) {
            return 'Location not available';
        }
        
        return court.location;
    }

    /**
     * Check if the current user is the owner of a court
     * @param {object} court - Court object
     * @returns {boolean} True if the current user is the owner
     */
    isCourtOwner(court) {
        const currentUser = authService.getCurrentUser();
        return currentUser && court.owner === currentUser.id;
    }

    /**
     * Get courts near a specific location
     * @param {number} latitude - Latitude
     * @param {number} longitude - Longitude
     * @param {number} radius - Search radius in kilometers
     * @returns {Promise<Array>} List of nearby courts
     */
    async getNearbyCourtsByCoordinates(latitude, longitude, radius = 10) {
        try {
            // This is a placeholder for future implementation
            // The backend needs to support geospatial queries
            console.warn('Geospatial search not yet implemented');
            
            // For now, just return all courts
            return await this.getCourts();
        } catch (error) {
            console.error('Error fetching nearby courts:', error);
            throw error;
        }
    }

    /**
     * Get courts near the user's current location
     * @param {number} radius - Search radius in kilometers
     * @returns {Promise<Array>} List of nearby courts
     */
    async getNearbyCourtsByUserLocation(radius = 10) {
        try {
            return new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error('Geolocation is not supported by your browser'));
                    return;
                }
                
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        try {
                            const courts = await this.getNearbyCourtsByCoordinates(
                                position.coords.latitude,
                                position.coords.longitude,
                                radius
                            );
                            resolve(courts);
                        } catch (error) {
                            reject(error);
                        }
                    },
                    (error) => {
                        reject(new Error(`Geolocation error: ${error.message}`));
                    }
                );
            });
        } catch (error) {
            console.error('Error fetching nearby courts:', error);
            throw error;
        }
    }
}

// Create and export a singleton instance
const courtService = new CourtService();
window.courtService = courtService; // Make it globally available

export default courtService;
