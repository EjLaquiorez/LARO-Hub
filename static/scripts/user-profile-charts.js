/**
 * LARO-Hub User Profile Charts
 * Handles chart initialization and rendering for the statistics section
 */

/**
 * Initialize performance trend chart
 */
function initializePerformanceTrendChart() {
    const ctx = document.getElementById('performance-trend-chart');
    if (!ctx) return;

    // Mock data for performance trend
    // In a real application, this would be fetched from the API
    const performanceTrend = [
        { date: 'Jan', points: 18.2 },
        { date: 'Feb', points: 19.5 },
        { date: 'Mar', points: 20.1 },
        { date: 'Apr', points: 22.3 },
        { date: 'May', points: 21.8 },
        { date: 'Jun', points: 23.5 }
    ];

    // Create chart
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: performanceTrend.map(item => item.date),
            datasets: [{
                label: 'Points Per Game',
                data: performanceTrend.map(item => item.points),
                borderColor: '#FFC925',
                backgroundColor: 'rgba(255, 201, 37, 0.1)',
                borderWidth: 3,
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#FFC925',
                pointBorderColor: '#000',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#FFC925',
                    bodyColor: '#fff',
                    borderColor: '#FFC925',
                    borderWidth: 1,
                    displayColors: false
                }
            }
        }
    });
}

/**
 * Initialize game type distribution chart
 */
function initializeGameTypeChart() {
    const ctx = document.getElementById('game-type-chart');
    if (!ctx) return;

    // Mock data for game type distribution
    // In a real application, this would be fetched from the API
    const gameTypes = {
        casual: 10,
        competitive: 15
    };

    // Create chart
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Casual', 'Competitive'],
            datasets: [{
                data: [gameTypes.casual, gameTypes.competitive],
                backgroundColor: ['rgba(255, 201, 37, 0.7)', 'rgba(255, 58, 94, 0.7)'],
                borderColor: ['#FFC925', '#FF3A5E'],
                borderWidth: 2,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        padding: 20,
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#FFC925',
                    bodyColor: '#fff',
                    borderColor: '#FFC925',
                    borderWidth: 1,
                    displayColors: false
                }
            }
        }
    });
}

/**
 * Initialize stats radar chart
 */
function initializeStatsRadarChart() {
    const ctx = document.getElementById('stats-radar-chart');
    if (!ctx) return;

    // Mock data for stats radar
    // In a real application, this would be fetched from the API
    const playerStats = {
        points: 21.5,
        rebounds: 7.2,
        assists: 5.8,
        steals: 1.5,
        blocks: 0.8,
        threePointPercentage: 38.5
    };

    // Create chart
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Points', 'Rebounds', 'Assists', 'Steals', 'Blocks', '3PT%'],
            datasets: [{
                label: 'Your Stats',
                data: [
                    playerStats.points / 30 * 100, // Scale to percentage (assuming 30 is max)
                    playerStats.rebounds / 15 * 100, // Scale to percentage (assuming 15 is max)
                    playerStats.assists / 10 * 100, // Scale to percentage (assuming 10 is max)
                    playerStats.steals / 5 * 100, // Scale to percentage (assuming 5 is max)
                    playerStats.blocks / 5 * 100, // Scale to percentage (assuming 5 is max)
                    playerStats.threePointPercentage // Already a percentage
                ],
                backgroundColor: 'rgba(255, 201, 37, 0.2)',
                borderColor: '#FFC925',
                borderWidth: 2,
                pointBackgroundColor: '#FFC925',
                pointBorderColor: '#000',
                pointBorderWidth: 2,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.2,
            scales: {
                r: {
                    angleLines: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    pointLabels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            size: 14
                        }
                    },
                    ticks: {
                        backdropColor: 'transparent',
                        color: 'rgba(255, 255, 255, 0.5)',
                        showLabelBackdrop: false
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#FFC925',
                    bodyColor: '#fff',
                    borderColor: '#FFC925',
                    borderWidth: 1,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            let value = context.raw || 0;

                            // Convert back to actual values
                            switch (label) {
                                case 'Points':
                                    return `Points: ${(value / 100 * 30).toFixed(1)}`;
                                case 'Rebounds':
                                    return `Rebounds: ${(value / 100 * 15).toFixed(1)}`;
                                case 'Assists':
                                    return `Assists: ${(value / 100 * 10).toFixed(1)}`;
                                case 'Steals':
                                    return `Steals: ${(value / 100 * 5).toFixed(1)}`;
                                case 'Blocks':
                                    return `Blocks: ${(value / 100 * 5).toFixed(1)}`;
                                case '3PT%':
                                    return `3PT%: ${value.toFixed(1)}%`;
                                default:
                                    return label;
                            }
                        }
                    }
                }
            }
        }
    });
}
