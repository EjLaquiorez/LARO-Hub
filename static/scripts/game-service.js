/**
 * Game Service
 * Handles game-related API calls and data management
 */

class GameService {
    constructor() {
        this.apiService = window.apiService;
        this.gamesCache = null;
        this.cacheExpiry = null;
        this.cacheDuration = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Get all games with optional filters
     * @param {Object} filters - Optional filters (status, game_type)
     * @param {boolean} forceRefresh - Whether to force a refresh of cached data
     * @returns {Promise<Array>} Array of game objects
     */
    async getGames(filters = {}, forceRefresh = false) {
        // Check if we have a valid cache
        const now = new Date().getTime();
        if (!forceRefresh && this.gamesCache && this.cacheExpiry && this.cacheExpiry > now) {
            console.log('Using cached games data');

            // Apply filters to cached data
            return this.filterGames(this.gamesCache, filters);
        }

        try {
            // Build query string from filters
            const queryParams = new URLSearchParams();
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.game_type) queryParams.append('game_type', filters.game_type);

            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

            // Try to fetch games from API
            try {
                const response = await this.apiService.authRequest(`/games/${queryString}`);

                // Update cache
                this.gamesCache = response.results || [];
                this.cacheExpiry = now + this.cacheDuration;

                return this.gamesCache;
            } catch (apiError) {
                console.warn('API request failed, falling back to sample data:', apiError);

                // If API fails, use sample data as fallback
                this.gamesCache = this.getSampleGames();
                this.cacheExpiry = now + this.cacheDuration;

                return this.filterGames(this.gamesCache, filters);
            }
        } catch (error) {
            console.error('Error in getGames:', error);
            // Return empty array instead of throwing to prevent UI errors
            return [];
        }
    }

    /**
     * Get sample games data (fallback when API fails)
     * @returns {Array} Array of sample game objects
     */
    getSampleGames() {
        // Get current date for relative dates
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Create dates for sample games
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        // Format dates as YYYY-MM-DD
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        return [
            {
                id: 1,
                title: "Friendly Match",
                date: formatDate(tomorrow),
                time: "15:30",
                location: "Palumco Basketball Court",
                court: { id: 1, name: "Palumco Basketball Court" },
                game_type: "casual",
                status: "pending",
                description: "Casual game for all skill levels. Everyone welcome!",
                max_participants: 10,
                participants: [
                    { id: 1, name: "John Doe", username: "johndoe" },
                    { id: 2, name: "Jane Smith", username: "janesmith" },
                    { id: 3, name: "Mike Johnson", username: "mikej" },
                    { id: 4, name: "Sarah Williams", username: "sarahw" }
                ],
                organizer: { id: 1, name: "John Doe" }
            },
            {
                id: 2,
                title: "3v3 Tournament",
                date: formatDate(dayAfterTomorrow),
                time: "17:00",
                location: "San Pedro Covered Court",
                court: { id: 2, name: "San Pedro Covered Court" },
                game_type: "tournament",
                status: "pending",
                description: "Competitive 3v3 tournament. Prizes for winners!",
                max_participants: 6,
                participants: [
                    { id: 1, name: "John Doe", username: "johndoe" },
                    { id: 5, name: "Alex Brown", username: "alexb" },
                    { id: 6, name: "Chris Davis", username: "chrisd" },
                    { id: 7, name: "Pat Wilson", username: "patw" },
                    { id: 8, name: "Taylor Jones", username: "taylorj" },
                    { id: 9, name: "Jordan Lee", username: "jordanl" }
                ],
                organizer: { id: 5, name: "Alex Brown" }
            },
            {
                id: 3,
                title: "Practice Game",
                date: formatDate(nextWeek),
                time: "19:30",
                location: "Sicsican Basketball Court",
                court: { id: 3, name: "Sicsican Basketball Court" },
                game_type: "practice",
                status: "pending",
                description: "Team practice session. Focus on drills and scrimmage.",
                max_participants: 10,
                participants: [
                    { id: 1, name: "John Doe", username: "johndoe" },
                    { id: 2, name: "Jane Smith", username: "janesmith" },
                    { id: 10, name: "Sam Garcia", username: "samg" },
                    { id: 11, name: "Robin Chen", username: "robinc" }
                ],
                organizer: { id: 1, name: "John Doe" }
            }
        ];
    }

    /**
     * Filter games based on criteria
     * @param {Array} games - Array of game objects
     * @param {Object} filters - Filter criteria
     * @returns {Array} Filtered games
     */
    filterGames(games, filters = {}) {
        if (!games || !Array.isArray(games)) return [];

        return games.filter(game => {
            // Apply status filter
            if (filters.status && game.status !== filters.status) {
                return false;
            }

            // Apply game type filter
            if (filters.game_type && game.game_type !== filters.game_type) {
                return false;
            }

            // Apply date filter (if provided)
            if (filters.date) {
                const gameDate = new Date(game.date).toISOString().split('T')[0];
                if (gameDate !== filters.date) {
                    return false;
                }
            }

            // Apply team filter (if provided)
            if (filters.team) {
                const teamId = parseInt(filters.team);
                if (game.team1.id !== teamId && game.team2.id !== teamId) {
                    return false;
                }
            }

            // Apply court filter (if provided)
            if (filters.court) {
                const courtId = parseInt(filters.court);
                if (game.court.id !== courtId) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * Get a specific game by ID
     * @param {number} gameId - Game ID
     * @returns {Promise<Object>} Game object
     */
    async getGame(gameId) {
        try {
            // Try to get game from API
            try {
                return await this.apiService.authRequest(`/games/${gameId}/`);
            } catch (apiError) {
                console.warn(`API request failed for game ${gameId}, checking cache:`, apiError);

                // Check if we have the game in cache
                if (this.gamesCache) {
                    const cachedGame = this.gamesCache.find(game => game.id == gameId);
                    if (cachedGame) {
                        console.log(`Found game ${gameId} in cache`);
                        return cachedGame;
                    }
                }

                // If not in cache, get sample games and check there
                const sampleGames = this.getSampleGames();
                const sampleGame = sampleGames.find(game => game.id == gameId);

                if (sampleGame) {
                    console.log(`Found game ${gameId} in sample data`);
                    return sampleGame;
                }

                // If not found anywhere, throw error
                throw new Error(`Game with ID ${gameId} not found`);
            }
        } catch (error) {
            console.error(`Error fetching game ${gameId}:`, error);
            throw error;
        }
    }

    /**
     * Create a new game
     * @param {Object} gameData - Game data
     * @returns {Promise<Object>} Created game
     */
    async createGame(gameData) {
        try {
            try {
                // Try to create game via API
                const response = await this.apiService.authRequest('/games/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(gameData)
                });

                // Invalidate cache
                this.gamesCache = null;
                this.cacheExpiry = null;

                return response;
            } catch (apiError) {
                console.warn('API request failed for creating game, using mock response:', apiError);

                // Create a mock response with the game data
                const mockGame = {
                    ...gameData,
                    id: Math.floor(Math.random() * 1000) + 100, // Random ID
                    created_at: new Date().toISOString(),
                    participants: [],
                    organizer: {
                        id: 1,
                        name: JSON.parse(localStorage.getItem('currentUser') || '{}').firstname || 'Current User'
                    }
                };

                // Add to cache if it exists
                if (this.gamesCache) {
                    this.gamesCache.push(mockGame);
                } else {
                    // Initialize cache with sample games plus this new one
                    this.gamesCache = [...this.getSampleGames(), mockGame];
                    this.cacheExpiry = new Date().getTime() + this.cacheDuration;
                }

                return mockGame;
            }
        } catch (error) {
            console.error('Error creating game:', error);
            throw error;
        }
    }

    /**
     * Update a game
     * @param {number} gameId - Game ID
     * @param {Object} gameData - Updated game data
     * @returns {Promise<Object>} Updated game
     */
    async updateGame(gameId, gameData) {
        try {
            const response = await this.apiService.authRequest(`/games/${gameId}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gameData)
            });

            // Invalidate cache
            this.gamesCache = null;
            this.cacheExpiry = null;

            return response;
        } catch (error) {
            console.error(`Error updating game ${gameId}:`, error);
            throw error;
        }
    }

    /**
     * Delete a game
     * @param {number} gameId - Game ID
     * @returns {Promise<void>}
     */
    async deleteGame(gameId) {
        try {
            await this.apiService.authRequest(`/games/${gameId}/`, {
                method: 'DELETE'
            });

            // Invalidate cache
            this.gamesCache = null;
            this.cacheExpiry = null;
        } catch (error) {
            console.error(`Error deleting game ${gameId}:`, error);
            throw error;
        }
    }

    /**
     * Get upcoming games for the current user
     * @returns {Promise<Array>} Array of upcoming games
     */
    async getUpcomingGames() {
        try {
            const games = await this.getGames({ status: 'pending' }, true);

            // Sort by date and time (ascending)
            return games.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time}`);
                const dateB = new Date(`${b.date}T${b.time}`);
                return dateA - dateB;
            });
        } catch (error) {
            console.error('Error fetching upcoming games:', error);
            throw error;
        }
    }
}

// Create a singleton instance
const gameService = new GameService();

// Export the singleton
window.gameService = gameService;
