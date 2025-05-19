/**
 * Game Details Module
 * Handles displaying game details and related actions
 */

/**
 * Show loading modal
 * @param {string} message - Loading message
 */
function showLoadingModal(message = 'Loading...') {
    // Create modal if it doesn't exist
    let loadingModal = document.getElementById('loading-modal');
    if (!loadingModal) {
        loadingModal = document.createElement('div');
        loadingModal.id = 'loading-modal';
        loadingModal.className = 'modal';
        loadingModal.innerHTML = `
            <div class="modal-content loading-modal-content">
                <div class="loading-spinner"></div>
                <p id="loading-message">${message}</p>
            </div>
        `;
        document.body.appendChild(loadingModal);
    } else {
        // Update message if modal exists
        const loadingMessage = loadingModal.querySelector('#loading-message');
        if (loadingMessage) {
            loadingMessage.textContent = message;
        }
    }
    
    // Show modal
    loadingModal.style.display = 'flex';
}

/**
 * Hide loading modal
 */
function hideLoadingModal() {
    const loadingModal = document.getElementById('loading-modal');
    if (loadingModal) {
        loadingModal.style.display = 'none';
    }
}

/**
 * Show game details modal
 * @param {Object} game - Game object
 */
function showGameDetailsModal(game) {
    // Format date
    const gameDate = new Date(game.date);
    const formattedDate = gameDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Create modal if it doesn't exist
    let gameDetailsModal = document.getElementById('game-details-modal');
    if (!gameDetailsModal) {
        gameDetailsModal = document.createElement('div');
        gameDetailsModal.id = 'game-details-modal';
        gameDetailsModal.className = 'modal';
        document.body.appendChild(gameDetailsModal);
    }
    
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
    
    // Update modal content
    gameDetailsModal.innerHTML = `
        <div class="modal-content game-details-modal-content">
            <div class="modal-header">
                <h2>${game.title || game.game_type || 'Basketball Game'}</h2>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="game-details-status">
                    <span class="game-status ${statusClass}">${statusText}</span>
                </div>
                <div class="game-details-section">
                    <h3>Game Information</h3>
                    <div class="game-details-grid">
                        <div class="game-detail-item">
                            <i class="bi bi-calendar"></i>
                            <div>
                                <strong>Date</strong>
                                <p>${formattedDate}</p>
                            </div>
                        </div>
                        <div class="game-detail-item">
                            <i class="bi bi-clock"></i>
                            <div>
                                <strong>Time</strong>
                                <p>${game.time || 'Not specified'}</p>
                            </div>
                        </div>
                        <div class="game-detail-item">
                            <i class="bi bi-geo-alt"></i>
                            <div>
                                <strong>Location</strong>
                                <p>${game.location || game.court?.name || 'TBD'}</p>
                            </div>
                        </div>
                        <div class="game-detail-item">
                            <i class="bi bi-people"></i>
                            <div>
                                <strong>Participants</strong>
                                <p>${participantsCount}</p>
                            </div>
                        </div>
                        <div class="game-detail-item">
                            <i class="bi bi-trophy"></i>
                            <div>
                                <strong>Game Type</strong>
                                <p>${game.game_type || 'Casual'}</p>
                            </div>
                        </div>
                        <div class="game-detail-item">
                            <i class="bi bi-person"></i>
                            <div>
                                <strong>Organizer</strong>
                                <p>${game.organizer?.name || 'Unknown'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="game-details-section">
                    <h3>Description</h3>
                    <p>${game.description || 'No description provided.'}</p>
                </div>
                <div class="game-details-section">
                    <h3>Participants</h3>
                    <div class="participants-list">
                        ${game.participants && game.participants.length > 0 ? 
                            game.participants.map(participant => `
                                <div class="participant-item">
                                    <div class="participant-avatar">
                                        <i class="bi bi-person-circle"></i>
                                    </div>
                                    <div class="participant-info">
                                        <p>${participant.name || participant.username || 'Unknown'}</p>
                                    </div>
                                </div>
                            `).join('') : 
                            '<p>No participants yet.</p>'
                        }
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                ${game.status === 'pending' ? 
                    `<button class="join-game-btn" data-game-id="${game.id}">Join Game</button>` : 
                    ''
                }
                <button class="close-modal-btn">Close</button>
            </div>
        </div>
    `;
    
    // Show modal
    gameDetailsModal.style.display = 'block';
    
    // Add event listeners
    const closeButtons = gameDetailsModal.querySelectorAll('.close-modal, .close-modal-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            gameDetailsModal.style.display = 'none';
        });
    });
    
    // Add join game button event listener
    const joinGameBtn = gameDetailsModal.querySelector('.join-game-btn');
    if (joinGameBtn) {
        joinGameBtn.addEventListener('click', function() {
            joinGame(game.id);
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === gameDetailsModal) {
            gameDetailsModal.style.display = 'none';
        }
    });
}

/**
 * Join a game
 * @param {string|number} gameId - Game ID
 */
async function joinGame(gameId) {
    try {
        // Show loading state
        const joinGameBtn = document.querySelector(`.join-game-btn[data-game-id="${gameId}"]`);
        if (joinGameBtn) {
            const originalText = joinGameBtn.textContent;
            joinGameBtn.disabled = true;
            joinGameBtn.innerHTML = '<i class="bi bi-arrow-repeat spinning"></i> Joining...';
        }
        
        // In a real implementation, this would call an API to join the game
        // For now, we'll just simulate a successful join
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Show success message
        alert('You have successfully joined the game!');
        
        // Close modal
        const gameDetailsModal = document.getElementById('game-details-modal');
        if (gameDetailsModal) {
            gameDetailsModal.style.display = 'none';
        }
        
        // Refresh upcoming games
        if (typeof displayUpcomingGames === 'function') {
            displayUpcomingGames();
        }
    } catch (error) {
        console.error(`Error joining game ${gameId}:`, error);
        
        // Show error message
        alert('Failed to join game. Please try again later.');
        
        // Reset button
        const joinGameBtn = document.querySelector(`.join-game-btn[data-game-id="${gameId}"]`);
        if (joinGameBtn) {
            joinGameBtn.disabled = false;
            joinGameBtn.textContent = 'Join Game';
        }
    }
}

/**
 * Open create game modal
 */
function openCreateGameModal() {
    const createGamePopup = document.getElementById("create-game-popup");
    if (createGamePopup) {
        createGamePopup.style.display = "flex";
        document.body.style.overflow = "hidden";
        
        // Reset form if needed
        const invitationForm = document.getElementById('invitation-form');
        if (invitationForm) invitationForm.reset();
        
        // Clear any previously selected location
        const locationCards = document.querySelectorAll('.location-card');
        locationCards.forEach(c => c.classList.remove('selected'));
    }
}

// Make functions available globally
window.showLoadingModal = showLoadingModal;
window.hideLoadingModal = hideLoadingModal;
window.showGameDetailsModal = showGameDetailsModal;
window.joinGame = joinGame;
window.openCreateGameModal = openCreateGameModal;
