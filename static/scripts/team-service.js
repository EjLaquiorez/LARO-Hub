/**
 * Team Service
 * Handles team-related API calls and data management
 */

class TeamService {
    constructor() {
        this.apiService = window.apiService;
        this.teamsCache = null;
        this.cacheExpiry = null;
        this.cacheDuration = 10 * 60 * 1000; // 10 minutes
    }

    /**
     * Get all teams with optional filters
     * @param {Object} filters - Optional filters
     * @param {boolean} forceRefresh - Whether to force a refresh of cached data
     * @returns {Promise<Array>} Array of team objects
     */
    async getTeams(filters = {}, forceRefresh = false) {
        // Check if we have a valid cache
        const now = new Date().getTime();
        if (!forceRefresh && this.teamsCache && this.cacheExpiry && this.cacheExpiry > now) {
            console.log('Using cached teams data');
            
            // Apply filters to cached data
            return this.filterTeams(this.teamsCache, filters);
        }
        
        try {
            // For now, we'll use the hardcoded data since the API endpoint isn't fully implemented
            // In a real implementation, this would be:
            // const response = await this.apiService.authRequest('/teams/');
            // this.teamsCache = response.results || [];
            
            // Using hardcoded data for now
            this.teamsCache = this.getHardcodedTeams();
            this.cacheExpiry = now + this.cacheDuration;
            
            return this.filterTeams(this.teamsCache, filters);
        } catch (error) {
            console.error('Error fetching teams:', error);
            throw error;
        }
    }
    
    /**
     * Filter teams based on criteria
     * @param {Array} teams - Array of team objects
     * @param {Object} filters - Filter criteria
     * @returns {Array} Filtered teams
     */
    filterTeams(teams, filters = {}) {
        if (!teams || !Array.isArray(teams)) return [];
        
        return teams.filter(team => {
            // Apply name filter
            if (filters.name && !team.name.toLowerCase().includes(filters.name.toLowerCase())) {
                return false;
            }
            
            // Apply user filter (teams the user is a member of)
            if (filters.userIsMember === true) {
                if (!team.isMember) {
                    return false;
                }
            }
            
            // Apply user filter (teams the user is not a member of)
            if (filters.userIsMember === false) {
                if (team.isMember) {
                    return false;
                }
            }
            
            return true;
        });
    }
    
    /**
     * Get a specific team by ID
     * @param {number} teamId - Team ID
     * @returns {Promise<Object>} Team object
     */
    async getTeam(teamId) {
        try {
            // For now, we'll use the hardcoded data
            const teams = await this.getTeams();
            return teams.find(team => team.id === teamId);
            
            // In a real implementation, this would be:
            // return await this.apiService.authRequest(`/teams/${teamId}/`);
        } catch (error) {
            console.error(`Error fetching team ${teamId}:`, error);
            throw error;
        }
    }
    
    /**
     * Create a new team
     * @param {Object} teamData - Team data
     * @returns {Promise<Object>} Created team
     */
    async createTeam(teamData) {
        try {
            // In a real implementation, this would be:
            // const response = await this.apiService.authRequest('/teams/', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify(teamData)
            // });
            
            // Simulate API response
            const newTeam = {
                id: Math.floor(Math.random() * 1000) + 10,
                name: teamData.name,
                description: teamData.description || '',
                logo: teamData.logo || null,
                members: [
                    {
                        id: 1,
                        username: 'currentuser',
                        role: 'captain'
                    }
                ],
                created_at: new Date().toISOString(),
                isMember: true
            };
            
            // Invalidate cache
            this.teamsCache = null;
            this.cacheExpiry = null;
            
            return newTeam;
        } catch (error) {
            console.error('Error creating team:', error);
            throw error;
        }
    }
    
    /**
     * Get user's teams
     * @returns {Promise<Array>} Array of teams the user is a member of
     */
    async getUserTeams() {
        try {
            const teams = await this.getTeams({ userIsMember: true });
            return teams;
        } catch (error) {
            console.error('Error fetching user teams:', error);
            throw error;
        }
    }
    
    /**
     * Get hardcoded teams data (temporary until API is fully implemented)
     * @returns {Array} Array of team objects
     */
    getHardcodedTeams() {
        return [
            {
                id: 1,
                name: "Palawan Panthers",
                description: "Competitive basketball team from Palawan State University",
                logo: "https://placehold.co/100x100/orange/white?text=PP",
                members: [
                    {
                        id: 1,
                        username: "currentuser",
                        role: "captain"
                    },
                    {
                        id: 2,
                        username: "player2",
                        role: "member"
                    }
                ],
                created_at: "2023-05-15T10:30:00Z",
                isMember: true
            },
            {
                id: 2,
                name: "Puerto Ballers",
                description: "Recreational team from Puerto Princesa",
                logo: "https://placehold.co/100x100/blue/white?text=PB",
                members: [
                    {
                        id: 3,
                        username: "player3",
                        role: "captain"
                    },
                    {
                        id: 4,
                        username: "player4",
                        role: "member"
                    }
                ],
                created_at: "2023-06-20T14:15:00Z",
                isMember: false
            },
            {
                id: 3,
                name: "Tiniguiban Tigers",
                description: "Community basketball team from Tiniguiban",
                logo: "https://placehold.co/100x100/yellow/black?text=TT",
                members: [
                    {
                        id: 5,
                        username: "player5",
                        role: "captain"
                    },
                    {
                        id: 1,
                        username: "currentuser",
                        role: "member"
                    }
                ],
                created_at: "2023-04-10T09:45:00Z",
                isMember: true
            }
        ];
    }
}

// Create a singleton instance
const teamService = new TeamService();

// Export the singleton
window.teamService = teamService;
