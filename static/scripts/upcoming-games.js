/**
 * Upcoming Games Module
 * Handles displaying and interacting with upcoming games
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Display upcoming games on page load
    await displayUpcomingGames();
    
    // Add event listener to refresh button if it exists
    const refreshGamesBtn = document.getElementById('refresh-games-btn');
    if (refreshGamesBtn) {
        refreshGamesBtn.addEventListener('click', async () => {
            await displayUpcomingGames(true); // Force refresh
        });
    }
});

/**
 * Display upcoming games in the dashboard
 * @param {boolean} forceRefresh - Whether to force a refresh of cached data
 */
async function displayUpcomingGames(forceRefresh = false) {
    const upcomingGamesContainer = document.getElementById('upcoming-games-container');
    if (!upcomingGamesContainer) return;

    // Show loading state
    upcomingGamesContainer.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading upcoming games...</p>
        </div>
    `;

    try {
        // Fetch upcoming games from the game service
        const upcomingGames = await window.gameService.getUpcomingGames(forceRefresh);

        // Clear container
        upcomingGamesContainer.innerHTML = '';

        // Check if there are upcoming games
        if (upcomingGames.length === 0) {
            upcomingGamesContainer.innerHTML = `
                <div class="no-games-message">
                    <p>You don't have any upcoming games.</p>
                    <button class="create-game-btn">Create a Game</button>
                </div>
            `;
            
            // Add event listener to create game button
            const createGameBtn = upcomingGamesContainer.querySelector('.create-game-btn');
            if (createGameBtn) {
                createGameBtn.addEventListener('click', function() {
                    openCreateGameModal();
                });
            }
            
            return;
        }

        // Create game cards
        upcomingGames.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';
            gameCard.dataset.gameId = game.id;

            // Format date
            const gameDate = new Date(game.date);
            const formattedDate = gameDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });

            // Create status class based on game status
            let statusClass = '';
            let statusText = game.status;
            
            if (game.status === 'pending') {
                statusClass = 'status-open';
                statusText = 'Open';
            } else if (game.status === 'confirmed') {
                statusClass = 'status-confirmed';
                statusText = 'Confirmed';
            } else if (game.status === 'full') {
                statusClass = 'status-full';
                statusText = 'Full';
            } else if (game.status === 'cancelled') {
                statusClass = 'status-cancelled';
                statusText = 'Cancelled';
            } else if (game.status === 'completed') {
                statusClass = 'status-completed';
                statusText = 'Completed';
            }

            // Get participants count
            const participantsCount = game.participants ? 
                `${game.participants.length}/${game.max_participants || 10}` : 
                "0/10";

            gameCard.innerHTML = `
                <div class="game-card-header">
                    <h3>${game.title || game.game_type || 'Basketball Game'}</h3>
                    <span class="game-status ${statusClass}">${statusText}</span>
                </div>
                <div class="game-card-details">
                    <div class="game-detail">
                        <i class="bi bi-calendar"></i>
                        <span>${formattedDate}</span>
                    </div>
                    <div class="game-detail">
                        <i class="bi bi-clock"></i>
                        <span>${game.time || '00:00'}</span>
                    </div>
                    <div class="game-detail">
                        <i class="bi bi-geo-alt"></i>
                        <span>${game.location || game.court?.name || 'TBD'}</span>
                    </div>
                    <div class="game-detail">
                        <i class="bi bi-people"></i>
                        <span>${participantsCount}</span>
                    </div>
                </div>
                <div class="game-card-actions">
                    <button class="view-details-btn" data-game-id="${game.id}">View Details</button>
                </div>
            `;

            upcomingGamesContainer.appendChild(gameCard);
        });

        // Add event listeners to view details buttons
        document.querySelectorAll('.view-details-btn').forEach(button => {
            button.addEventListener('click', function() {
                const gameId = this.dataset.gameId;
                viewGameDetails(gameId);
            });
        });
    } catch (error) {
        console.error('Error displaying upcoming games:', error);
        upcomingGamesContainer.innerHTML = `
            <div class="error-message">
                <p>Failed to load upcoming games. Please try again later.</p>
                <button class="retry-btn">Retry</button>
            </div>
        `;
        
        // Add event listener to retry button
        const retryBtn = upcomingGamesContainer.querySelector('.retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', function() {
                displayUpcomingGames(true); // Force refresh on retry
            });
        }
    }
}

/**
 * View game details
 * @param {string|number} gameId - Game ID
 */
async function viewGameDetails(gameId) {
    try {
        // Show loading modal
        showLoadingModal('Loading game details...');
        
        // Fetch game details
        const game = await window.gameService.getGame(gameId);
        
        // Hide loading modal
        hideLoadingModal();
        
        // Show game details modal
        showGameDetailsModal(game);
    } catch (error) {
        console.error(`Error viewing game details for game ${gameId}:`, error);
        
        // Hide loading modal
        hideLoadingModal();
        
        // Show error message
        alert('Failed to load game details. Please try again later.');
    }
}

// Make functions available globally
window.displayUpcomingGames = displayUpcomingGames;
window.viewGameDetails = viewGameDetails;
