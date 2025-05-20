/**
 * API Service for LARO-Hub
 * Handles all API requests to the backend
 */

import authService from './auth-service.js';

class ApiService {
    /**
     * Make an authenticated API request
     * @param {string} endpoint - API endpoint path
     * @param {object} options - Fetch options
     * @returns {Promise<any>} Promise resolving to response data
     */
    async request(endpoint, options = {}) {
        try {
            const response = await authService.apiRequest(endpoint, options);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `API request failed with status ${response.status}`);
            }
            
            // For 204 No Content responses, return null
            if (response.status === 204) {
                return null;
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API request error for ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Get current user profile
     * @returns {Promise<object>} User profile data
     */
    async getCurrentUser() {
        return this.request('/api/current-user/');
    }

    /**
     * Update user profile
     * @param {object} profileData - Updated profile data
     * @returns {Promise<object>} Updated user profile
     */
    async updateProfile(profileData) {
        const userId = authService.getCurrentUser()?.id;
        if (!userId) {
            throw new Error('User not authenticated');
        }
        
        return this.request(`/api/users/${userId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData),
        });
    }

    /**
     * Get all basketball courts
     * @returns {Promise<Array>} List of courts
     */
    async getCourts() {
        // Endpoint needs to be implemented on the backend
        return this.request('/api/courts/');
    }

    /**
     * Get court details by ID
     * @param {number} courtId - Court ID
     * @returns {Promise<object>} Court details
     */
    async getCourtById(courtId) {
        return this.request(`/api/courts/${courtId}/`);
    }

    /**
     * Get all games
     * @param {object} filters - Optional filters
     * @returns {Promise<Array>} List of games
     */
    async getGames(filters = {}) {
        const queryParams = new URLSearchParams();
        
        // Add filters to query params
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value);
            }
        });
        
        const queryString = queryParams.toString();
        const endpoint = queryString ? `/api/games/?${queryString}` : '/api/games/';
        
        return this.request(endpoint);
    }

    /**
     * Get game details by ID
     * @param {number} gameId - Game ID
     * @returns {Promise<object>} Game details
     */
    async getGameById(gameId) {
        return this.request(`/api/games/${gameId}/`);
    }

    /**
     * Create a new game
     * @param {object} gameData - Game data
     * @returns {Promise<object>} Created game
     */
    async createGame(gameData) {
        return this.request('/api/games/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(gameData),
        });
    }

    /**
     * Update a game
     * @param {number} gameId - Game ID
     * @param {object} gameData - Updated game data
     * @returns {Promise<object>} Updated game
     */
    async updateGame(gameId, gameData) {
        return this.request(`/api/games/${gameId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(gameData),
        });
    }

    /**
     * Join a game
     * @param {number} gameId - Game ID
     * @returns {Promise<object>} Updated game
     */
    async joinGame(gameId) {
        // This endpoint needs to be implemented on the backend
        return this.request(`/api/games/${gameId}/join/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    /**
     * Leave a game
     * @param {number} gameId - Game ID
     * @returns {Promise<object>} Updated game
     */
    async leaveGame(gameId) {
        // This endpoint needs to be implemented on the backend
        return this.request(`/api/games/${gameId}/leave/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    /**
     * Get all teams
     * @returns {Promise<Array>} List of teams
     */
    async getTeams() {
        // This endpoint needs to be implemented on the backend
        return this.request('/api/teams/');
    }

    /**
     * Create a new team
     * @param {object} teamData - Team data
     * @returns {Promise<object>} Created team
     */
    async createTeam(teamData) {
        // This endpoint needs to be implemented on the backend
        return this.request('/api/teams/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(teamData),
        });
    }

    /**
     * Get conversations for current user
     * @returns {Promise<Array>} List of conversations
     */
    async getConversations() {
        return this.request('/api/conversations/');
    }

    /**
     * Get messages for a conversation
     * @param {number} conversationId - Conversation ID
     * @returns {Promise<Array>} List of messages
     */
    async getMessages(conversationId) {
        return this.request(`/api/conversations/${conversationId}/messages/`);
    }

    /**
     * Send a message
     * @param {number} conversationId - Conversation ID
     * @param {string} content - Message content
     * @returns {Promise<object>} Created message
     */
    async sendMessage(conversationId, content) {
        return this.request(`/api/conversations/${conversationId}/messages/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
        });
    }
}

// Create and export a singleton instance
const apiService = new ApiService();
window.apiService = apiService; // Make it globally available

export default apiService;
