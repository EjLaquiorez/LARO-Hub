/**
 * Court Service
 * Handles court-related API calls and data management
 */

class CourtService {
    constructor() {
        this.apiService = window.apiService;
        this.courtsCache = null;
        this.cacheExpiry = null;
        this.cacheDuration = 10 * 60 * 1000; // 10 minutes
    }

    /**
     * Get all courts with optional filters
     * @param {Object} filters - Optional filters
     * @param {boolean} forceRefresh - Whether to force a refresh of cached data
     * @returns {Promise<Array>} Array of court objects
     */
    async getCourts(filters = {}, forceRefresh = false) {
        // Check if we have a valid cache
        const now = new Date().getTime();
        if (!forceRefresh && this.courtsCache && this.cacheExpiry && this.cacheExpiry > now) {
            console.log('Using cached courts data');
            
            // Apply filters to cached data
            return this.filterCourts(this.courtsCache, filters);
        }
        
        try {
            // For now, we'll use the hardcoded data since the API endpoint isn't fully implemented
            // In a real implementation, this would be:
            // const response = await this.apiService.authRequest('/courts/');
            // this.courtsCache = response.results || [];
            
            // Using hardcoded data for now
            this.courtsCache = this.getHardcodedCourts();
            this.cacheExpiry = now + this.cacheDuration;
            
            return this.filterCourts(this.courtsCache, filters);
        } catch (error) {
            console.error('Error fetching courts:', error);
            throw error;
        }
    }
    
    /**
     * Filter courts based on criteria
     * @param {Array} courts - Array of court objects
     * @param {Object} filters - Filter criteria
     * @returns {Array} Filtered courts
     */
    filterCourts(courts, filters = {}) {
        if (!courts || !Array.isArray(courts)) return [];
        
        return courts.filter(court => {
            // Apply name filter
            if (filters.name && !court.name.toLowerCase().includes(filters.name.toLowerCase())) {
                return false;
            }
            
            // Apply location filter
            if (filters.location && !court.location.toLowerCase().includes(filters.location.toLowerCase())) {
                return false;
            }
            
            // Apply status filter
            if (filters.status && court.status !== filters.status) {
                return false;
            }
            
            // Apply distance filter (if provided)
            if (filters.maxDistance && court.distance) {
                const distance = parseFloat(court.distance);
                if (distance > filters.maxDistance) {
                    return false;
                }
            }
            
            return true;
        });
    }
    
    /**
     * Get a specific court by ID
     * @param {number} courtId - Court ID
     * @returns {Promise<Object>} Court object
     */
    async getCourt(courtId) {
        try {
            // For now, we'll use the hardcoded data
            const courts = await this.getCourts();
            return courts.find(court => court.id === courtId);
            
            // In a real implementation, this would be:
            // return await this.apiService.authRequest(`/courts/${courtId}/`);
        } catch (error) {
            console.error(`Error fetching court ${courtId}:`, error);
            throw error;
        }
    }
    
    /**
     * Get nearby courts based on user's location
     * @param {Object} userLocation - User's location {latitude, longitude}
     * @param {number} radius - Search radius in kilometers
     * @returns {Promise<Array>} Array of nearby courts
     */
    async getNearbyCourts(userLocation, radius = 5) {
        try {
            const courts = await this.getCourts();
            
            // Calculate distance for each court
            const courtsWithDistance = courts.map(court => {
                const distance = this.calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    court.coords[0],
                    court.coords[1]
                );
                
                return {
                    ...court,
                    distance: distance.toFixed(1),
                    distanceValue: distance
                };
            });
            
            // Filter by radius and sort by distance
            return courtsWithDistance
                .filter(court => court.distanceValue <= radius)
                .sort((a, b) => a.distanceValue - b.distanceValue);
        } catch (error) {
            console.error('Error fetching nearby courts:', error);
            throw error;
        }
    }
    
    /**
     * Calculate distance between two coordinates using Haversine formula
     * @param {number} lat1 - Latitude of point 1
     * @param {number} lon1 - Longitude of point 1
     * @param {number} lat2 - Latitude of point 2
     * @param {number} lon2 - Longitude of point 2
     * @returns {number} Distance in kilometers
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the earth in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c; // Distance in km
        return distance;
    }
    
    /**
     * Convert degrees to radians
     * @param {number} deg - Degrees
     * @returns {number} Radians
     */
    deg2rad(deg) {
        return deg * (Math.PI/180);
    }
    
    /**
     * Get hardcoded courts data (temporary until API is fully implemented)
     * @returns {Array} Array of court objects
     */
    getHardcodedCourts() {
        return [
            {
                id: 1,
                coords: [9.7722, 118.7460],
                name: "Palumco Basketball Court",
                location: "Tiniguiban",
                image: "https://images.unsplash.com/photo-1505666287802-931dc83a0fe4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFza2V0YmFsbCUyMGNvdXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
                currentPlayers: "6/10",
                hours: "Open 6AM - 10PM",
                rating: "4.5/5 (28 ratings)",
                features: ["Standard Size", "Covered Court", "Night Lighting", "Water Fountain"],
                status: "available",
                distance: "1.2 km"
            },
            {
                id: 2,
                coords: [9.7583, 118.7606],
                name: "San Pedro Covered Court",
                location: "San Pedro",
                image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmFza2V0YmFsbCUyMGNvdXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
                currentPlayers: "8/10",
                hours: "Open 7AM - 9PM",
                rating: "4.2/5 (15 ratings)",
                features: ["Standard Size", "Covered Court", "Night Lighting", "Bleachers", "Restrooms"],
                status: "busy",
                distance: "2.5 km"
            },
            {
                id: 3,
                coords: [9.7999, 118.7169],
                name: "Sicsican Basketball Court",
                location: "Sicsican",
                image: "https://images.unsplash.com/photo-1627627256672-027a4613d028?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YmFza2V0YmFsbCUyMGNvdXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
                currentPlayers: "0/10",
                hours: "Open 24 Hours",
                rating: "3.8/5 (12 ratings)",
                features: ["Standard Size", "Outdoor Court", "Night Lighting"],
                status: "available",
                distance: "3.8 km"
            }
        ];
    }
}

// Create a singleton instance
const courtService = new CourtService();

// Export the singleton
window.courtService = courtService;
