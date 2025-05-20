/**
 * LARO-Hub Enhanced User Profile
 * Handles user profile functionality including game history and statistics
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize enhanced profile page
    initEnhancedProfilePage();

    // Add window resize handler for charts
    window.addEventListener('resize', function() {
        // Check if statistics tab is active
        const statisticsTab = document.getElementById('statistics-tab');
        if (statisticsTab && statisticsTab.classList.contains('active')) {
            // Reinitialize charts on resize with a debounce
            clearTimeout(window.resizeTimer);
            window.resizeTimer = setTimeout(function() {
                initializeCharts();
            }, 250);
        }
    });
});

/**
 * Initialize the enhanced profile page
 */
async function initEnhancedProfilePage() {
    try {
        // Load user data
        const userData = await loadUserData();

        // Set up tab navigation
        setupTabNavigation();

        // Load game history
        loadGameHistory();

        // Load statistics
        loadStatistics();

        // Set up filter handlers
        setupFilterHandlers();
    } catch (error) {
        console.error('Error initializing enhanced profile page:', error);
        showError('Failed to load profile data. Please try again later.');
    }
}

/**
 * Load user data from API
 * @returns {Object} User data
 */
async function loadUserData() {
    try {
        // Get current user data
        const userData = await window.apiService.authRequest('/current-user/');
        return userData;
    } catch (error) {
        console.error('Error loading user data:', error);

        // Try to get user data from localStorage as fallback
        const storedUserData = localStorage.getItem('currentUser');
        if (storedUserData) {
            return JSON.parse(storedUserData);
        }

        throw new Error('Failed to load user data');
    }
}

/**
 * Set up tab navigation
 */
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Get tab ID
            const tabId = button.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');

            // Update URL hash
            window.location.hash = tabId;

            // Initialize charts if statistics tab is active
            if (tabId === 'statistics') {
                // Add a small delay to ensure the tab is fully visible before initializing charts
                setTimeout(() => {
                    initializeCharts();
                }, 50);
            }
        });
    });

    // Check for hash in URL
    const hash = window.location.hash.substring(1);
    if (hash) {
        // Check if hash corresponds to a visible tab
        const tabButton = document.querySelector(`.tab-button[data-tab="${hash}"]`);
        if (tabButton) {
            tabButton.click();
        } else if (['edit', 'password', 'settings'].includes(hash)) {
            // If hash is for a hidden tab, show the info tab and then trigger the appropriate action
            const infoTabButton = document.querySelector('.tab-button[data-tab="info"]');
            if (infoTabButton) {
                infoTabButton.click();

                // Wait for the tab to be shown before triggering the action
                setTimeout(() => {
                    switch (hash) {
                        case 'edit':
                            showEditProfileForm();
                            break;
                        case 'password':
                            showChangePasswordForm();
                            break;
                        case 'settings':
                            showAccountSettings();
                            break;
                    }
                }, 100);
            }
        }
    }
}

/**
 * Load game history
 */
function loadGameHistory() {
    // Mock data for game history
    // In a real application, this would be fetched from the API
    const gameHistory = [
        {
            id: 1,
            date: '2023-06-15',
            location: 'Palumco Basketball Court',
            opponent: 'Streetball Kings',
            score: '78-65',
            result: 'win',
            gameType: 'competitive',
            stats: {
                points: 22,
                rebounds: 8,
                assists: 5
            }
        },
        {
            id: 2,
            date: '2023-06-10',
            location: 'San Pedro Covered Court',
            opponent: 'Hoops Elite',
            score: '65-70',
            result: 'loss',
            gameType: 'competitive',
            stats: {
                points: 18,
                rebounds: 6,
                assists: 7
            }
        },
        {
            id: 3,
            date: '2023-06-05',
            location: 'Sicsican Basketball Court',
            opponent: 'Court Masters',
            score: '82-75',
            result: 'win',
            gameType: 'casual',
            stats: {
                points: 25,
                rebounds: 10,
                assists: 3
            }
        },
        {
            id: 4,
            date: '2023-05-28',
            location: 'Palumco Basketball Court',
            opponent: 'Ballers United',
            score: '90-85',
            result: 'win',
            gameType: 'competitive',
            stats: {
                points: 30,
                rebounds: 5,
                assists: 8
            }
        },
        {
            id: 5,
            date: '2023-05-20',
            location: 'San Pedro Covered Court',
            opponent: 'Hoop Dreams',
            score: '72-80',
            result: 'loss',
            gameType: 'casual',
            stats: {
                points: 15,
                rebounds: 7,
                assists: 6
            }
        }
    ];

    // Render game history
    renderGameHistory(gameHistory);
}

/**
 * Render game history
 * @param {Array} games - Array of game objects
 * @param {string} filter - Filter by game type
 */
function renderGameHistory(games, filter = 'all') {
    const gameHistoryContainer = document.getElementById('game-history-list');
    if (!gameHistoryContainer) return;

    // Clear container
    gameHistoryContainer.innerHTML = '';

    // Filter games if needed
    const filteredGames = filter === 'all' ? games : games.filter(game => game.gameType === filter);

    // Check if there are games to display
    if (filteredGames.length === 0) {
        gameHistoryContainer.innerHTML = `
            <div class="no-games">
                <p>No games found for the selected filter.</p>
            </div>
        `;
        return;
    }

    // Render each game
    filteredGames.forEach(game => {
        const gameElement = document.createElement('div');
        gameElement.className = `game-item ${game.result}`;

        gameElement.innerHTML = `
            <div class="game-date">
                <span class="date">${formatDate(game.date)}</span>
                <span class="game-type">${game.gameType}</span>
            </div>
            <div class="game-details">
                <div class="location">
                    <i class="bi bi-geo-alt"></i> ${game.location}
                </div>
                <div class="opponent">
                    <span>vs</span> ${game.opponent}
                </div>
                <div class="score ${game.result}">
                    ${game.score}
                </div>
            </div>
            <div class="game-stats">
                <div class="stat">
                    <span class="stat-value">${game.stats.points}</span>
                    <span class="stat-label">PTS</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${game.stats.rebounds}</span>
                    <span class="stat-label">REB</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${game.stats.assists}</span>
                    <span class="stat-label">AST</span>
                </div>
            </div>
        `;

        gameHistoryContainer.appendChild(gameElement);
    });

    // Update pagination
    updatePagination(filteredGames.length);
}

/**
 * Format date to readable format
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Update pagination
 * @param {number} totalGames - Total number of games
 */
function updatePagination(totalGames) {
    const paginationContainer = document.getElementById('game-history-pagination');
    if (!paginationContainer) return;

    // Clear container
    paginationContainer.innerHTML = '';

    // Calculate number of pages
    const gamesPerPage = 5;
    const totalPages = Math.ceil(totalGames / gamesPerPage);

    // Create pagination elements
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = 'pagination-button';
        pageButton.textContent = i;

        if (i === 1) {
            pageButton.classList.add('active');
        }

        pageButton.addEventListener('click', () => {
            // Update active page
            document.querySelectorAll('.pagination-button').forEach(btn => {
                btn.classList.remove('active');
            });
            pageButton.classList.add('active');

            // TODO: Implement pagination logic
            // This would typically involve fetching the appropriate page of data
        });

        paginationContainer.appendChild(pageButton);
    }
}

/**
 * Load statistics
 */
function loadStatistics() {
    // Mock data for statistics
    // In a real application, this would be fetched from the API
    const statistics = {
        totalGames: 25,
        wins: 15,
        losses: 10,
        winPercentage: 60,
        averages: {
            points: 21.5,
            rebounds: 7.2,
            assists: 5.8,
            steals: 1.5,
            blocks: 0.8
        },
        gameTypes: {
            casual: 10,
            competitive: 15
        },
        performanceTrend: [
            { date: '2023-01', points: 18.2 },
            { date: '2023-02', points: 19.5 },
            { date: '2023-03', points: 20.1 },
            { date: '2023-04', points: 22.3 },
            { date: '2023-05', points: 21.8 },
            { date: '2023-06', points: 23.5 }
        ]
    };

    // Update statistics summary
    updateStatisticsSummary(statistics);
}

/**
 * Update statistics summary
 * @param {Object} statistics - Statistics data
 */
function updateStatisticsSummary(statistics) {
    // Update total games
    const totalGamesElement = document.getElementById('total-games');
    if (totalGamesElement) {
        totalGamesElement.textContent = statistics.totalGames;
    }

    // Update wins
    const winsElement = document.getElementById('total-wins');
    if (winsElement) {
        winsElement.textContent = statistics.wins;
    }

    // Update losses
    const lossesElement = document.getElementById('total-losses');
    if (lossesElement) {
        lossesElement.textContent = statistics.losses;
    }

    // Update win percentage
    const winPercentageElement = document.getElementById('win-percentage');
    if (winPercentageElement) {
        winPercentageElement.textContent = `${statistics.winPercentage}%`;
    }

    // Update averages
    Object.keys(statistics.averages).forEach(key => {
        const element = document.getElementById(`avg-${key}`);
        if (element) {
            element.textContent = statistics.averages[key].toFixed(1);
        }
    });
}

/**
 * Initialize charts
 */
function initializeCharts() {
    // Clear any existing charts to prevent duplicates
    Chart.helpers.each(Chart.instances, function(instance) {
        instance.destroy();
    });

    // Wait for the DOM to be fully rendered
    setTimeout(() => {
        // Initialize performance trend chart
        initializePerformanceTrendChart();

        // Initialize game type distribution chart
        initializeGameTypeChart();

        // Initialize stats radar chart
        initializeStatsRadarChart();
    }, 100);
}

/**
 * Set up filter handlers
 */
function setupFilterHandlers() {
    const filterButtons = document.querySelectorAll('.game-filter-button');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            button.classList.add('active');

            // Get filter value
            const filter = button.getAttribute('data-filter');

            // Reload game history with filter
            loadGameHistory(filter);
        });
    });
}
