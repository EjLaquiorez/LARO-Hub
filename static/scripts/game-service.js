/**
 * Game Service for LARO-Hub
 * Handles game-related functionality including creating, joining, and managing games
 */

import apiService from './api-service.js';
import authService from './auth-service.js';

class GameService {
    /**
     * Get all games with optional filters
     * @param {object} filters - Optional filters for games
     * @returns {Promise<Array>} List of games
     */
    async getGames(filters = {}) {
        try {
            return await apiService.getGames(filters);
        } catch (error) {
            console.error('Error fetching games:', error);
            throw error;
        }
    }

    /**
     * Get game details by ID
     * @param {number} gameId - Game ID
     * @returns {Promise<object>} Game details
     */
    async getGameById(gameId) {
        try {
            return await apiService.getGameById(gameId);
        } catch (error) {
            console.error(`Error fetching game ${gameId}:`, error);
            throw error;
        }
    }

    /**
     * Create a new game
     * @param {object} gameData - Game data
     * @returns {Promise<object>} Created game
     */
    async createGame(gameData) {
        try {
            return await apiService.createGame(gameData);
        } catch (error) {
            console.error('Error creating game:', error);
            throw error;
        }
    }

    /**
     * Update a game
     * @param {number} gameId - Game ID
     * @param {object} gameData - Updated game data
     * @returns {Promise<object>} Updated game
     */
    async updateGame(gameId, gameData) {
        try {
            return await apiService.updateGame(gameId, gameData);
        } catch (error) {
            console.error(`Error updating game ${gameId}:`, error);
            throw error;
        }
    }

    /**
     * Join a game
     * @param {number} gameId - Game ID
     * @returns {Promise<object>} Updated game
     */
    async joinGame(gameId) {
        try {
            return await apiService.joinGame(gameId);
        } catch (error) {
            console.error(`Error joining game ${gameId}:`, error);
            throw error;
        }
    }

    /**
     * Leave a game
     * @param {number} gameId - Game ID
     * @returns {Promise<object>} Updated game
     */
    async leaveGame(gameId) {
        try {
            return await apiService.leaveGame(gameId);
        } catch (error) {
            console.error(`Error leaving game ${gameId}:`, error);
            throw error;
        }
    }

    /**
     * Get games created by the current user
     * @returns {Promise<Array>} List of games
     */
    async getMyCreatedGames() {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            throw new Error('User not authenticated');
        }

        try {
            return await apiService.getGames({ creator: currentUser.id });
        } catch (error) {
            console.error('Error fetching created games:', error);
            throw error;
        }
    }

    /**
     * Get games the current user is participating in
     * @returns {Promise<Array>} List of games
     */
    async getMyJoinedGames() {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            throw new Error('User not authenticated');
        }

        try {
            return await apiService.getGames({ participant: currentUser.id });
        } catch (error) {
            console.error('Error fetching joined games:', error);
            throw error;
        }
    }

    /**
     * Get upcoming games
     * @returns {Promise<Array>} List of upcoming games
     */
    async getUpcomingGames() {
        try {
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            return await apiService.getGames({ date_from: formattedDate, status: 'scheduled' });
        } catch (error) {
            console.error('Error fetching upcoming games:', error);
            throw error;
        }
    }

    /**
     * Get games by court
     * @param {number} courtId - Court ID
     * @returns {Promise<Array>} List of games at the specified court
     */
    async getGamesByCourt(courtId) {
        try {
            return await apiService.getGames({ court: courtId });
        } catch (error) {
            console.error(`Error fetching games for court ${courtId}:`, error);
            throw error;
        }
    }

    /**
     * Get games by team
     * @param {number} teamId - Team ID
     * @returns {Promise<Array>} List of games for the specified team
     */
    async getGamesByTeam(teamId) {
        try {
            return await apiService.getGames({ team: teamId });
        } catch (error) {
            console.error(`Error fetching games for team ${teamId}:`, error);
            throw error;
        }
    }

    /**
     * Format game date and time for display
     * @param {string} date - Game date in ISO format
     * @param {string} time - Game time
     * @returns {string} Formatted date and time
     */
    formatGameDateTime(date, time) {
        try {
            const gameDate = new Date(date);
            const formattedDate = gameDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            return `${formattedDate} at ${time}`;
        } catch (error) {
            console.error('Error formatting game date and time:', error);
            return `${date} ${time}`;
        }
    }

    /**
     * Check if the current user is the creator of a game
     * @param {object} game - Game object
     * @returns {boolean} True if the current user is the creator
     */
    isGameCreator(game) {
        const currentUser = authService.getCurrentUser();
        return currentUser && game.creator === currentUser.id;
    }

    /**
     * Check if the current user is a participant in a game
     * @param {object} game - Game object
     * @returns {boolean} True if the current user is a participant
     */
    isGameParticipant(game) {
        const currentUser = authService.getCurrentUser();
        return currentUser && game.participants && game.participants.includes(currentUser.id);
    }
}

// Create and export a singleton instance
const gameService = new GameService();
window.gameService = gameService; // Make it globally available

export default gameService;
