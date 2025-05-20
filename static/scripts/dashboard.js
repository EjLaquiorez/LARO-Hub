// Import services
import authService from './auth-service.js';
import apiService from './api-service.js';
import gameService from './game-service.js';
import courtService from './court-service.js';

document.addEventListener("DOMContentLoaded", async () => {
    // Prevent scrolling on the dashboard
    document.body.style.overflow = 'hidden';

    // Ensure body remains unscrollable on resize
    window.addEventListener('resize', () => {
        document.body.style.overflow = 'hidden';
    });

    // Initialize notification dropdown
    initNotificationDropdown();

    // Display username in the profile link
    displayUsername();
    // Buttons and Popups
    const upcomingGameBtn = document.querySelector(".btn.upcoming-game");
    const upcomingPopup = document.getElementById("upcoming-game-popup");
    const closeUpcomingPopupBtn = document.getElementById("close-popup");

    const nearbyCourtsBtn = document.querySelector(".btn.nearby-courts");
    const nearbyPopup = document.getElementById("nearby-courts-popup");
    const closeNearbyPopupBtn = document.getElementById("close-nearby-popup");

    const quickJoinOverlay = document.getElementById("quick-join-overlay");
    const quickJoinBtn = document.querySelector(".btn.quick-join");
    const closeQuickJoinBtn = document.getElementById("close-quick-join");

    // Function to format date as YYYY-MM-DD (defined early for use in sample data)
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Function to parse date string (YYYY-MM-DD) to Date object
    function parseDate(dateString) {
        const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
        return new Date(year, month - 1, day);
    }

    // Sample data - Enhanced schedule data with dates relative to current date
    const schedules = (() => {
        // Get current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentDay = now.getDate();

        // Create a date 3 days from now for the next upcoming game
        const nextGameDate = new Date(currentYear, currentMonth, currentDay + 3);
        const nextGameDateStr = formatDate(nextGameDate);

        // Create a date 7 days from now for another upcoming game
        const secondGameDate = new Date(currentYear, currentMonth, currentDay + 7);
        const secondGameDateStr = formatDate(secondGameDate);

        // Create a date 12 days from now for a third upcoming game
        const thirdGameDate = new Date(currentYear, currentMonth, currentDay + 12);
        const thirdGameDateStr = formatDate(thirdGameDate);

        // Create a date 5 days ago for a past game
        const pastGameDate1 = new Date(currentYear, currentMonth, currentDay - 5);
        const pastGameDateStr1 = formatDate(pastGameDate1);

        // Create a date 10 days ago for another past game
        const pastGameDate2 = new Date(currentYear, currentMonth, currentDay - 10);
        const pastGameDateStr2 = formatDate(pastGameDate2);

        return [
            {
                id: 1,
                date: nextGameDateStr,
                time: "3:00 PM",
                location: "Palumco Basketball Court",
                barangay: "Tiniguiban",
                players: "6/10",
                status: "upcoming",
                type: "Casual Game"
            },
            {
                id: 2,
                date: secondGameDateStr,
                time: "5:00 PM",
                location: "San Pedro Covered Court",
                barangay: "San Pedro",
                players: "8/10",
                status: "upcoming",
                type: "Tournament"
            },
            {
                id: 3,
                date: thirdGameDateStr,
                time: "6:30 PM",
                location: "Sicsican Basketball Court",
                barangay: "Sicsican",
                players: "4/10",
                status: "upcoming",
                type: "Practice"
            },
            {
                id: 4,
                date: pastGameDateStr1,
                time: "4:00 PM",
                location: "Palumco Basketball Court",
                barangay: "Tiniguiban",
                players: "10/10",
                status: "past",
                type: "Casual Game"
            },
            {
                id: 5,
                date: pastGameDateStr2,
                time: "7:00 PM",
                location: "San Pedro Covered Court",
                barangay: "San Pedro",
                players: "8/10",
                status: "past",
                type: "Tournament"
            }
        ];
    })();

    // Basketball court data
    let basketballCourts = {};

    // Function to fetch courts from the API
    async function fetchCourts() {
        try {
            const courts = await courtService.getCourts();

            // Process courts into the format expected by the UI
            courts.forEach(court => {
                const courtKey = court.name.toLowerCase().replace(/\s+/g, '_');

                // Default image if none provided
                const defaultImages = [
                    "https://images.unsplash.com/photo-1505666287802-931dc83a0fe4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFza2V0YmFsbCUyMGNvdXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
                    "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmFza2V0YmFsbCUyMGNvdXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
                    "https://images.unsplash.com/photo-1627627256672-027a4613d028?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YmFza2V0YmFsbCUyMGNvdXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
                ];
                const randomImage = defaultImages[Math.floor(Math.random() * defaultImages.length)];

                // Extract barangay from location if available
                const locationParts = court.location ? court.location.split(',') : [];
                const barangay = locationParts.length > 1 ? locationParts[0].trim() : 'Unknown';

                // Create court object in the format expected by the UI
                basketballCourts[courtKey] = {
                    id: court.id,
                    coords: [0, 0], // Placeholder for coordinates
                    name: court.name,
                    barangay: barangay,
                    image: court.image || randomImage,
                    currentPlayers: "0/10", // Placeholder until we have real-time data
                    hours: court.availability || "Open 24 Hours",
                    rating: "New", // Placeholder until we have ratings
                    features: ["Standard Size", "Basketball Court"],
                    status: "available", // Placeholder until we have real-time data
                    distance: "Unknown", // Placeholder until we have geolocation
                    rental_fee: court.rental_fee || "Free"
                };
            });

            // If no courts were found, use sample data
            if (Object.keys(basketballCourts).length === 0) {
                basketballCourts = {
                    "tiniguiban": {
                        coords: [9.7722, 118.7460],
                        name: "Palumco Basketball Court",
                        barangay: "Tiniguiban",
                        image: "https://images.unsplash.com/photo-1505666287802-931dc83a0fe4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFza2V0YmFsbCUyMGNvdXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
                        currentPlayers: "6/10",
                        hours: "Open 6AM - 10PM",
                        rating: "4.5/5 (28 ratings)",
                        features: ["Standard Size", "Covered Court", "Night Lighting", "Water Fountain"],
                        status: "available", // available or busy
                        distance: "1.2 km"
                    },
                    "san_pedro": {
                        coords: [9.7583, 118.7606],
                        name: "San Pedro Covered Court",
                        barangay: "San Pedro",
                        image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmFza2V0YmFsbCUyMGNvdXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
                        currentPlayers: "8/10",
                        hours: "Open 7AM - 9PM",
                        rating: "4.2/5 (15 ratings)",
                        features: ["Standard Size", "Covered Court", "Night Lighting", "Bleachers", "Restrooms"],
                        status: "busy", // available or busy
                        distance: "2.5 km"
                    },
                    "sicsican": {
                        coords: [9.7999, 118.7169],
                        name: "Sicsican Basketball Court",
                        barangay: "Sicsican",
                        image: "https://images.unsplash.com/photo-1627627256672-027a4613d028?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YmFza2V0YmFsbCUyMGNvdXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
                        currentPlayers: "0/10",
                        hours: "Open 24 Hours",
                        rating: "3.8/5 (12 ratings)",
                        features: ["Standard Size", "Outdoor Court", "Night Lighting"],
                        status: "available", // available or busy
                        distance: "3.8 km"
                    }
                };
            }

            // Update the UI with the courts
            updateNearbyCourtsList();

        } catch (error) {
            console.error('Error fetching courts:', error);

            // Use sample data as fallback
            basketballCourts = {
                "tiniguiban": {
                    coords: [9.7722, 118.7460],
                    name: "Palumco Basketball Court",
                    barangay: "Tiniguiban",
                    image: "https://images.unsplash.com/photo-1505666287802-931dc83a0fe4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFza2V0YmFsbCUyMGNvdXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
                    currentPlayers: "6/10",
                    hours: "Open 6AM - 10PM",
                    rating: "4.5/5 (28 ratings)",
                    features: ["Standard Size", "Covered Court", "Night Lighting", "Water Fountain"],
                    status: "available", // available or busy
                    distance: "1.2 km"
                },
                "san_pedro": {
                    coords: [9.7583, 118.7606],
                    name: "San Pedro Covered Court",
                    barangay: "San Pedro",
                    image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmFza2V0YmFsbCUyMGNvdXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
                    currentPlayers: "8/10",
                    hours: "Open 7AM - 9PM",
                    rating: "4.2/5 (15 ratings)",
                    features: ["Standard Size", "Covered Court", "Night Lighting", "Bleachers", "Restrooms"],
                    status: "busy", // available or busy
                    distance: "2.5 km"
                },
                "sicsican": {
                    coords: [9.7999, 118.7169],
                    name: "Sicsican Basketball Court",
                    barangay: "Sicsican",
                    image: "https://images.unsplash.com/photo-1627627256672-027a4613d028?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YmFza2V0YmFsbCUyMGNvdXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
                    currentPlayers: "0/10",
                    hours: "Open 24 Hours",
                    rating: "3.8/5 (12 ratings)",
                    features: ["Standard Size", "Outdoor Court", "Night Lighting"],
                    status: "available", // available or busy
                    distance: "3.8 km"
                }
            };

            // Update the UI with the fallback courts
            updateNearbyCourtsList();
        }
    }

    // Fetch courts when the page loads
    fetchCourts();

    // Calendar and Schedule functionality for Upcoming Games
    const calendarDays = document.getElementById("calendar-days");
    const currentMonthElement = document.getElementById("current-month");
    const prevMonthBtn = document.getElementById("prev-month");
    const nextMonthBtn = document.getElementById("next-month");
    const scheduleList = document.getElementById("schedule-list");
    const scheduleFilters = document.querySelectorAll(".schedule-filter");
    const nextGameDateElement = document.getElementById("next-game-date");

    // Initialize calendar variables
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    // Function to generate calendar
    function generateCalendar(month, year) {
        // Check if calendar elements exist
        if (!calendarDays || !currentMonthElement) {
            console.error("Calendar elements not found");
            return;
        }

        calendarDays.innerHTML = '';

        // Update month display
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        currentMonthElement.textContent = `${monthNames[month]} ${year}`;

        // Get first day of month and total days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Get previous month's days to display
        const prevMonthDays = new Date(year, month, 0).getDate();

        // Get dates with events
        const eventDates = schedules.map(schedule => schedule.date);

        // Current date for highlighting today
        const today = formatDate(new Date());

        // Add previous month's days
        for (let i = firstDay - 1; i >= 0; i--) {
            const dayElement = document.createElement("div");
            dayElement.className = "calendar-day other-month";
            dayElement.textContent = prevMonthDays - i;
            calendarDays.appendChild(dayElement);
        }

        // Add current month's days
        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = document.createElement("div");
            dayElement.className = "calendar-day";
            dayElement.textContent = i;

            // Format date to check for events
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

            // Check if this day has an event
            if (eventDates.includes(dateString)) {
                dayElement.classList.add("has-event");

                // Add click event to filter schedules by this date
                dayElement.addEventListener("click", () => {
                    // Remove selected class from all days
                    document.querySelectorAll(".calendar-day").forEach(day => {
                        day.classList.remove("selected");
                    });

                    // Add selected class to this day
                    dayElement.classList.add("selected");

                    // Filter schedules by this date
                    filterSchedulesByDate(dateString);

                    // Reset filter buttons
                    if (scheduleFilters) {
                        scheduleFilters.forEach(filter => {
                            filter.classList.remove("active");
                        });
                    }
                });
            }

            // Check if this is today
            if (dateString === today) {
                dayElement.classList.add("today");
            }

            calendarDays.appendChild(dayElement);
        }

        // Add next month's days to fill the grid
        const totalDaysDisplayed = firstDay + daysInMonth;
        const nextMonthDays = 42 - totalDaysDisplayed; // 6 rows of 7 days

        for (let i = 1; i <= nextMonthDays; i++) {
            const dayElement = document.createElement("div");
            dayElement.className = "calendar-day other-month";
            dayElement.textContent = i;
            calendarDays.appendChild(dayElement);
        }
    }

    // Function to populate schedule list
    function populateScheduleList(filteredSchedules = schedules) {
        // Check if schedule list element exists
        if (!scheduleList) {
            console.error("Schedule list element not found");
            return;
        }

        scheduleList.innerHTML = '';

        if (!filteredSchedules || filteredSchedules.length === 0) {
            scheduleList.innerHTML = '<li class="no-schedules">No scheduled games found</li>';
            return;
        }

        filteredSchedules.forEach(schedule => {
            try {
                const li = document.createElement("li");

                // Format date for display
                const scheduleDate = parseDate(schedule.date);
                const formattedDate = scheduleDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                });

                li.innerHTML = `
                    <div class="schedule-date">
                        <i class="bi bi-calendar-event"></i> ${formattedDate}
                    </div>
                    <div class="schedule-location">${schedule.location}</div>
                    <div class="schedule-time">
                        <i class="bi bi-clock"></i> ${schedule.time} - ${schedule.type}
                    </div>
                    <div class="schedule-players">
                        <div class="players-count">
                            <i class="bi bi-people"></i> ${schedule.players} players
                        </div>
                        <div class="schedule-status status-${schedule.status}">${schedule.status}</div>
                    </div>
                `;

                scheduleList.appendChild(li);
            } catch (error) {
                console.error("Error creating schedule item:", error);
            }
        });
    }

    // Function to filter schedules by date
    function filterSchedulesByDate(dateString) {
        try {
            if (!dateString) {
                console.error("Invalid date string for filtering");
                populateScheduleList();
                return;
            }

            const filteredSchedules = schedules.filter(schedule => schedule.date === dateString);
            populateScheduleList(filteredSchedules);
        } catch (error) {
            console.error("Error filtering schedules by date:", error);
            populateScheduleList();
        }
    }

    // Function to filter schedules by status
    function filterSchedulesByStatus(status) {
        try {
            if (status === 'all') {
                populateScheduleList();
            } else if (status === 'upcoming' || status === 'past') {
                const filteredSchedules = schedules.filter(schedule => schedule.status === status);
                populateScheduleList(filteredSchedules);
            } else {
                console.error("Invalid status for filtering:", status);
                populateScheduleList();
            }
        } catch (error) {
            console.error("Error filtering schedules by status:", error);
            populateScheduleList();
        }
    }

    // Function to find and display the next upcoming game
    function updateNextGameDate() {
        // Check if the element exists
        if (!nextGameDateElement) {
            console.error("Next game date element not found");
            return;
        }

        try {
            // Get current date without time component
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const today = formatDate(now);

            // Filter upcoming games (dates that are today or in the future)
            const upcomingGames = schedules.filter(schedule => {
                // Check both status and date
                if (schedule.status !== 'upcoming') return false;

                // Compare dates properly
                const gameDate = parseDate(schedule.date);
                gameDate.setHours(0, 0, 0, 0);
                return gameDate >= now;
            });

            // Sort by date (ascending)
            upcomingGames.sort((a, b) => {
                const dateA = parseDate(a.date);
                const dateB = parseDate(b.date);
                return dateA - dateB;
            });

            // Get the next game (first in the sorted array)
            if (upcomingGames.length > 0) {
                const nextGame = upcomingGames[0];
                const nextGameDate = parseDate(nextGame.date);

                // Format the date for display (e.g., "MARCH 25")
                const month = nextGameDate.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
                const day = nextGameDate.getDate();
                const formattedDate = `${month} ${day}`;

                // Update the button text
                nextGameDateElement.textContent = formattedDate;
            } else {
                // No upcoming games
                nextGameDateElement.textContent = "NO GAMES";
            }
        } catch (error) {
            console.error("Error updating next game date:", error);
            // Ensure we don't leave "Loading..." text
            nextGameDateElement.textContent = "NO GAMES";
        }
    }

    // Initialize calendar and schedule list with error handling
    try {
        // Initialize the next game date first (most important for the dashboard)
        updateNextGameDate();

        // Then initialize the calendar and schedule list if we're viewing the popup
        if (calendarDays && scheduleList) {
            generateCalendar(currentMonth, currentYear);
            populateScheduleList();
        }

        // Add event listeners for month navigation
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener("click", () => {
                currentMonth--;
                if (currentMonth < 0) {
                    currentMonth = 11;
                    currentYear--;
                }
                generateCalendar(currentMonth, currentYear);
            });
        }

        if (nextMonthBtn) {
            nextMonthBtn.addEventListener("click", () => {
                currentMonth++;
                if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                }
                generateCalendar(currentMonth, currentYear);
            });
        }

        // Add event listeners for schedule filters
        if (scheduleFilters && scheduleFilters.length > 0) {
            scheduleFilters.forEach(filter => {
                filter.addEventListener("click", function() {
                    try {
                        // Remove active class from all filters
                        scheduleFilters.forEach(f => f.classList.remove("active"));

                        // Add active class to clicked filter
                        this.classList.add("active");

                        // Filter schedules by status
                        const status = this.getAttribute("data-filter");
                        filterSchedulesByStatus(status);

                        // Remove selected class from all days
                        document.querySelectorAll(".calendar-day").forEach(day => {
                            day.classList.remove("selected");
                        });
                    } catch (error) {
                        console.error("Error in filter click handler:", error);
                    }
                });
            });
        }
    } catch (error) {
        console.error("Error initializing calendar and schedule:", error);

        // Make sure the next game date is still updated even if other parts fail
        if (!nextGameDateElement || nextGameDateElement.textContent === "Loading...") {
            try {
                updateNextGameDate();
            } catch (e) {
                console.error("Failed to update next game date:", e);
                if (nextGameDateElement) {
                    nextGameDateElement.textContent = "NO GAMES";
                }
            }
        }
    }

    // Add event listeners for action buttons with error handling
    try {
        const createGameBtn = document.getElementById("create-game-btn");
        const joinGameBtn = document.getElementById("join-game-btn");

        if (createGameBtn) {
            createGameBtn.addEventListener("click", () => {
                try {
                    alert("Create Game functionality will be implemented soon!");
                } catch (error) {
                    console.error("Error in create game button handler:", error);
                }
            });
        }

        if (joinGameBtn) {
            joinGameBtn.addEventListener("click", () => {
                try {
                    if (upcomingPopup && nearbyPopup) {
                        closePopup(upcomingPopup);
                        showPopup(nearbyPopup);
                    } else {
                        console.error("Popup elements not found for join game action");
                    }
                } catch (error) {
                    console.error("Error in join game button handler:", error);
                }
            });
        }
    } catch (error) {
        console.error("Error setting up action buttons:", error);
    }

    /**
     * Display the username in the profile navigation link
     */
    function displayUsername() {
        const usernameDisplay = document.getElementById('username-display');
        if (!usernameDisplay) return;

        try {
            // Get user data from auth service
            const user = authService.getCurrentUser();

            if (user) {
                // Check if username exists
                if (user.username) {
                    usernameDisplay.textContent = user.username.toUpperCase();
                } else if (user.firstname && user.lastname) {
                    // Use first name if username is not available
                    usernameDisplay.textContent = user.firstname.toUpperCase();
                } else if (user.email) {
                    // Fallback to email if username and name are not available
                    const emailUsername = user.email.split('@')[0];
                    usernameDisplay.textContent = emailUsername.toUpperCase();
                }
            } else {
                // If no user data, try to fetch it
                apiService.getCurrentUser()
                    .then(userData => {
                        if (userData) {
                            // Store user data
                            localStorage.setItem('currentUser', JSON.stringify(userData));
                            // Update auth service user data
                            authService.user = userData;

                            // Update display
                            if (userData.username) {
                                usernameDisplay.textContent = userData.username.toUpperCase();
                            } else if (userData.firstname && userData.lastname) {
                                usernameDisplay.textContent = userData.firstname.toUpperCase();
                            } else if (userData.email) {
                                const emailUsername = userData.email.split('@')[0];
                                usernameDisplay.textContent = emailUsername.toUpperCase();
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching user data:', error);
                    });
            }
        } catch (error) {
            console.error('Error displaying username:', error);
            // Keep default "PROFILE" text if there's an error
        }
    }

    /**
     * Initialize notification dropdown functionality
     */
    function initNotificationDropdown() {
        const notificationBell = document.getElementById('notification-bell');
        const notificationDropdown = document.querySelector('.notification-dropdown');
        const notificationList = document.querySelector('.notification-list');
        const notificationBadge = document.querySelector('.notification-badge');

        if (!notificationBell || !notificationDropdown || !notificationList) return;

        // Update notification badge count
        function updateNotificationBadge() {
            const unreadCount = window.notificationService.getUnreadCount();
            if (unreadCount > 0) {
                notificationBadge.textContent = unreadCount > 9 ? '9+' : unreadCount;
                notificationBadge.style.display = 'flex';
            } else {
                notificationBadge.style.display = 'none';
            }
        }

        // Render notifications in the dropdown
        function renderNotifications(filter = 'all') {
            // Clear existing notifications
            notificationList.innerHTML = '';

            // Get notifications from service
            let notifications = window.notificationService.getNotifications();

            // Apply filter if needed
            if (filter === 'unread') {
                notifications = notifications.filter(notification => !notification.read);
            }

            // If no notifications, show a message
            if (notifications.length === 0) {
                notificationList.innerHTML = `
                    <div class="no-notifications">
                        <p>No notifications to display</p>
                    </div>
                `;
                return;
            }

            // Create notification items
            notifications.forEach(notification => {
                const notificationItem = document.createElement('div');
                notificationItem.className = `notification-item${notification.read ? '' : ' unread'}`;
                notificationItem.dataset.id = notification.id;

                // Format timestamp
                const timestamp = formatTimestamp(notification.timestamp);

                // Create avatar element
                let avatarHtml = '';
                if (notification.isAlert) {
                    avatarHtml = `
                        <div class="notification-avatar alert-icon">
                            <i class="bi bi-exclamation-triangle-fill"></i>
                        </div>
                    `;
                } else {
                    avatarHtml = `
                        <div class="notification-avatar">
                            <img src="${notification.avatar || '/static/img/laro-icon.png'}" alt="Avatar">
                        </div>
                    `;
                }

                // Create content
                notificationItem.innerHTML = `
                    ${avatarHtml}
                    <div class="notification-content">
                        <p>${notification.content}</p>
                        <span class="notification-time">${timestamp}</span>
                    </div>
                    ${!notification.read ? '<div class="notification-status"><span class="status-dot"></span></div>' : ''}
                `;

                // Add click event to mark as read
                notificationItem.addEventListener('click', function() {
                    const id = parseInt(this.dataset.id);
                    window.notificationService.markAsRead(id);
                    this.classList.remove('unread');
                    const statusDot = this.querySelector('.status-dot');
                    if (statusDot) {
                        statusDot.parentElement.remove();
                    }
                    updateNotificationBadge();
                });

                notificationList.appendChild(notificationItem);
            });
        }

        // Format timestamp to relative time (e.g., "2h ago")
        function formatTimestamp(timestamp) {
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now - date;
            const diffSec = Math.floor(diffMs / 1000);
            const diffMin = Math.floor(diffSec / 60);
            const diffHour = Math.floor(diffMin / 60);
            const diffDay = Math.floor(diffHour / 24);

            if (diffDay > 0) {
                return diffDay === 1 ? '1d' : `${diffDay}d`;
            } else if (diffHour > 0) {
                return `${diffHour}h`;
            } else if (diffMin > 0) {
                return `${diffMin}m`;
            } else {
                return 'Just now';
            }
        }

        // Initial render
        updateNotificationBadge();
        renderNotifications();

        // Add listener for notification changes
        window.notificationService.addListener(() => {
            updateNotificationBadge();
            if (notificationDropdown.classList.contains('show')) {
                // If dropdown is open, re-render with current filter
                const activeFilter = document.querySelector('.notification-option.active');
                const filter = activeFilter.textContent.trim().toLowerCase();
                renderNotifications(filter);
            }
        });

        // Toggle dropdown when clicking the bell
        notificationBell.addEventListener('click', function(e) {
            e.preventDefault();
            notificationDropdown.classList.toggle('show');

            // If showing dropdown, re-render notifications
            if (notificationDropdown.classList.contains('show')) {
                renderNotifications();
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function closeDropdown(event) {
            if (notificationDropdown.classList.contains('show') &&
                !notificationDropdown.contains(event.target) &&
                !notificationBell.contains(event.target)) {
                notificationDropdown.classList.remove('show');
            }
        });

        // Handle notification option buttons (All/Unread)
        const notificationOptions = document.querySelectorAll('.notification-option');
        notificationOptions.forEach(option => {
            option.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent closing the dropdown

                // Remove active class from all options
                notificationOptions.forEach(opt => opt.classList.remove('active'));

                // Add active class to clicked option
                this.classList.add('active');

                // Filter notifications based on option
                const filter = this.textContent.trim().toLowerCase();
                renderNotifications(filter);
            });
        });

        // Handle "See previous notifications" button
        const seePreviousButton = document.querySelector('.see-previous');
        if (seePreviousButton) {
            seePreviousButton.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent closing the dropdown

                // In a real app, this would load more notifications
                // For demo, we'll just show a message
                this.textContent = 'Loading...';

                setTimeout(() => {
                    this.textContent = 'No more notifications';
                    this.disabled = true;
                }, 1000);
            });
        }

        // Handle "See all" link
        const seeAllLink = document.querySelector('.see-all');
        if (seeAllLink) {
            seeAllLink.addEventListener('click', function(e) {
                // Mark all as read before navigating
                window.notificationService.markAllAsRead();
                updateNotificationBadge();
            });
        }
    }

    // Populate Nearby Courts grid
    const courtsGrid = nearbyPopup.querySelector("#nearby-courts-grid");

    // Function to update the nearby courts list
    function updateNearbyCourtsList() {
        // Call the function to generate court cards
        generateNearbyCourtCards();

        // Also update the court cards in the quick join overlay if it exists
        updateQuickJoinCourtCards();
    }

    // Function to generate court cards
    function generateNearbyCourtCards(searchQuery = "") {
        courtsGrid.innerHTML = "";

        Object.keys(basketballCourts).forEach(key => {
            const court = basketballCourts[key];

            // Filter by search query if provided
            if (searchQuery &&
                !court.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !court.barangay.toLowerCase().includes(searchQuery.toLowerCase())) {
                return;
            }

            const card = document.createElement("div");
            card.className = "nearby-court-card";
            card.innerHTML = `
                <div class="nearby-court-image">
                    <img src="${court.image}" alt="${court.name}">
                    <div class="nearby-court-status">
                        <span class="nearby-status-dot ${court.status}"></span>
                        ${court.status === 'available' ? 'Available' : 'Busy'}
                    </div>
                </div>
                <div class="nearby-court-content">
                    <div class="nearby-court-title">${court.name}</div>
                    <div class="nearby-court-location">
                        <i class="bi bi-geo-alt"></i> ${court.barangay} (${court.distance})
                    </div>
                    <div class="nearby-court-info">
                        <div class="nearby-court-players">
                            <i class="bi bi-people"></i> ${court.currentPlayers}
                        </div>
                        <div class="nearby-court-rating">
                            <i class="bi bi-star-fill"></i> ${court.rating.split('/')[0]}
                        </div>
                    </div>
                </div>
            `;

            // Add click event to open quick join with this court
            card.addEventListener("click", () => {
                closePopup(nearbyPopup);
                showPopup(quickJoinOverlay);

                // If there's a function to show court details, call it
                if (typeof showCourtDetails === 'function') {
                    setTimeout(() => {
                        showCourtDetails(court);
                    }, 300);
                } else {
                    // If the function isn't available yet, try to initialize the map
                    if (typeof initializeMap === 'function') {
                        setTimeout(() => {
                            window.dispatchEvent(new Event('resize'));
                            // Try again after map is initialized
                            if (typeof showCourtDetails === 'function') {
                                showCourtDetails(court);
                            }
                        }, 500);
                    }
                }
            });

            courtsGrid.appendChild(card);
        });
    }

    // Function to update the court cards in the quick join overlay
    function updateQuickJoinCourtCards() {
        const courtCardsContainer = document.getElementById("court-cards-container");
        if (!courtCardsContainer) return;

        // Clear existing cards
        courtCardsContainer.innerHTML = "";

        // Generate court cards for the quick join overlay
        Object.keys(basketballCourts).forEach(key => {
            const court = basketballCourts[key];

            const card = document.createElement("div");
            card.className = "court-card";
            card.dataset.courtId = key;

            // Add status class
            card.classList.add(court.status);

            card.innerHTML = `
                <div class="court-card-image">
                    <img src="${court.image}" alt="${court.name}">
                </div>
                <div class="court-card-content">
                    <div class="court-card-title">${court.name}</div>
                    <div class="court-card-location">${court.barangay}</div>
                    <div class="court-card-status">
                        <span class="status-dot ${court.status}"></span>
                        ${court.status === 'available' ? 'Available' : 'Busy'}
                    </div>
                </div>
            `;

            // Add click event to show court details
            card.addEventListener("click", () => {
                // Remove active class from all cards
                document.querySelectorAll(".court-card").forEach(c => c.classList.remove("active"));

                // Add active class to this card
                card.classList.add("active");

                // Show court details in sidebar
                if (typeof showCourtDetails === 'function') {
                    showCourtDetails(court);
                }
            });

            courtCardsContainer.appendChild(card);
        });
    }

    // Initial population of court cards
    generateNearbyCourtCards();

    // Add search functionality for nearby courts
    const searchNearbyCourts = document.getElementById("search-nearby-courts");
    if (searchNearbyCourts) {
        searchNearbyCourts.addEventListener("input", function() {
            generateNearbyCourtCards(this.value);
        });
    }

    // Helper functions
    const showPopup = (popup) => {
        popup.style.display = "flex";
        document.body.style.overflow = "hidden"; // Prevent body scrolling when modal is open

        // Add animation class to modal content
        const popupContent = popup.querySelector('.popup-content');
        if (popupContent) {
            popupContent.style.animation = 'fadeIn 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
        }
    };

    const closePopup = (popup) => {
        popup.style.display = "none";
        document.body.style.overflow = "hidden"; // Keep body unscrollable for dashboard

        // Reset animation for next open
        const popupContent = popup.querySelector('.popup-content');
        if (popupContent) {
            popupContent.style.animation = '';
        }
    };

    // Event Listeners - Upcoming
    upcomingGameBtn.addEventListener("click", () => showPopup(upcomingPopup));
    closeUpcomingPopupBtn.addEventListener("click", () => closePopup(upcomingPopup));
    window.addEventListener("click", (e) => {
        if (e.target === upcomingPopup) closePopup(upcomingPopup);
    });

    // Event Listeners - Nearby
    nearbyCourtsBtn.addEventListener("click", () => showPopup(nearbyPopup));
    closeNearbyPopupBtn.addEventListener("click", () => closePopup(nearbyPopup));
    window.addEventListener("click", (e) => {
        if (e.target === nearbyPopup) closePopup(nearbyPopup);
    });

    // Quick Join overlay toggle
    quickJoinBtn.addEventListener("click", () => {
        showPopup(quickJoinOverlay);
        // Initialize the map when the quick join overlay is shown
        if (typeof initializeMap === 'function') {
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 100);
        }
    });

    closeQuickJoinBtn.addEventListener("click", () => {
        // Close the sidebar if it's open
        const sidebar = document.getElementById("court-sidebar");
        if (sidebar && sidebar.classList.contains("active")) {
            sidebar.classList.remove("active");
            if (typeof adjustMapLayout === 'function') {
                adjustMapLayout();
            }
        }
        closePopup(quickJoinOverlay);
    });

    window.addEventListener("click", (e) => {
        if (e.target === quickJoinOverlay) {
            // Close the sidebar if it's open
            const sidebar = document.getElementById("court-sidebar");
            if (sidebar && sidebar.classList.contains("active")) {
                sidebar.classList.remove("active");
                if (typeof adjustMapLayout === 'function') {
                    adjustMapLayout();
                }
            }
            closePopup(quickJoinOverlay);
        }
    });

    // Create Game Modal
    const createGameBtn = document.querySelector(".btn.create-game");
    const createGamePopup = document.getElementById("create-game-popup");
    const closeCreateGamePopupBtn = document.getElementById("close-create-game-popup");
    const createGameSubmitBtn = document.getElementById("create-game-submit-btn");

    // Show create game modal
    createGameBtn.addEventListener("click", () => {
        showPopup(createGamePopup);
        // Reset form if needed
        const invitationForm = document.getElementById('invitation-form');
        if (invitationForm) invitationForm.reset();

        // Clear any previously selected location
        const locationCards = document.querySelectorAll('.location-card');
        locationCards.forEach(c => c.classList.remove('selected'));
    });

    // Close create game modal with button
    if (closeCreateGamePopupBtn) {
        closeCreateGamePopupBtn.addEventListener("click", () => closePopup(createGamePopup));
    }

    // Close create game modal when clicking outside
    window.addEventListener("click", (e) => {
        if (e.target === createGamePopup) closePopup(createGamePopup);
    });

    // Handle location card selection
    const locationCards = document.querySelectorAll('.location-card');
    locationCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove selected class from all cards
            locationCards.forEach(c => c.classList.remove('selected'));
            // Add selected class to clicked card
            this.classList.add('selected');
        });
    });

    // Handle game creation form submission
    if (createGameSubmitBtn) {
        createGameSubmitBtn.addEventListener('click', function(e) {
            e.preventDefault();

            // Get selected location
            const selectedLocation = document.querySelector('.location-card.selected');
            if (!selectedLocation) {
                alert('Please select a location');
                return;
            }

            // Validate form fields
            const date = document.getElementById('invitation-date').value;
            const time = document.getElementById('invitation-time').value;
            const gameType = document.getElementById('game-type').value;
            const eventName = document.getElementById('event-name').value;

            if (!date || !time || !gameType || !eventName) {
                alert('Please fill in all required fields');
                return;
            }

            // Get form data
            const location = selectedLocation.getAttribute('data-location');
            const notes = document.getElementById('event-notes').value;

            // Create game object
            const game = {
                location,
                date,
                time,
                gameType,
                eventName,
                notes
            };

            // Store game data (in a real app, this would be sent to a server)
            console.log('Game created:', game);

            // Show success message
            alert('Game created successfully!');

            // Close the popup
            closePopup(createGamePopup);
        });
    }

    // Handle sharing options button
    const shareOptionsBtn = document.getElementById('share-options-btn');
    if (shareOptionsBtn) {
        shareOptionsBtn.addEventListener('click', function() {
            alert('Sharing options will be available soon!');
        });
    }

    // Handle invite players button
    const invitePlayersBtn = document.getElementById('invite-players-btn');
    if (invitePlayersBtn) {
        invitePlayersBtn.addEventListener('click', function() {
            alert('Player invitation feature will be available soon!');
        });
    }

    document.querySelector(".btn.change-sport").addEventListener("click", () => {
        window.location.href = "/change-sport/";
    });

    // Highlight Active Nav Link
    const navLinks = document.querySelectorAll(".nav-links a");
    const currentPath = window.location.pathname;
    navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        // Check if the current path matches the link's href or if it's the root path and href is /dashboard/
        const isActive = currentPath === href ||
                        (currentPath === "/" && href === "/dashboard/") ||
                        (currentPath.endsWith("/") && href === currentPath.slice(0, -1)) ||
                        (!currentPath.endsWith("/") && href === currentPath + "/");
        link.classList.toggle("active", isActive);
    });
});
