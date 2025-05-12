/**
 * LARO Basketball Quick Join - Sidebar Implementation
 * Enhanced functionality for basketball court finder with sidebar layout
 */

// Basketball court data with enhanced details
const basketballCourts = {
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
    games: [
      {
        date: "Today, 4:00 PM",
        type: "3v3 Pickup",
        playersNeeded: "2 more players needed",
        skillLevel: "Intermediate"
      },
      {
        date: "Tomorrow, 9:00 AM",
        type: "5v5 Full Court",
        playersNeeded: "3 more players needed",
        skillLevel: "All Levels"
      }
    ],
    reviews: [
      {
        reviewer: "Michael J.",
        rating: "★★★★★",
        text: "Great court with good lighting for night games. Surface is well-maintained.",
        date: "2 weeks ago"
      },
      {
        reviewer: "Sarah T.",
        rating: "★★★★☆",
        text: "Nice covered court, protected from rain. Could use more seating for spectators.",
        date: "1 month ago"
      }
    ]
  },
  "san pedro": {
    coords: [9.7583, 118.7606],
    name: "San Pedro Covered Court",
    barangay: "San Pedro",
    image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmFza2V0YmFsbCUyMGNvdXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
    currentPlayers: "8/10",
    hours: "Open 5AM - 9PM",
    rating: "4.2/5 (16 ratings)",
    features: ["Standard Size", "Covered Court", "Bleachers", "Restrooms"],
    status: "busy", // available or busy
    games: [
      {
        date: "Today, 7:00 PM",
        type: "5v5 Full Court",
        playersNeeded: "1 more player needed",
        skillLevel: "Advanced"
      }
    ],
    reviews: [
      {
        reviewer: "James L.",
        rating: "★★★★☆",
        text: "Good court but gets crowded on weekends. Come early if you want to play.",
        date: "3 weeks ago"
      }
    ]
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
    games: [
      {
        date: "Tomorrow, 4:30 PM",
        type: "3v3 Half Court",
        playersNeeded: "4 more players needed",
        skillLevel: "Beginner Friendly"
      }
    ],
    reviews: [
      {
        reviewer: "David W.",
        rating: "★★★☆☆",
        text: "Decent outdoor court. Surface is a bit rough in some spots.",
        date: "1 month ago"
      }
    ]
  }
};

document.addEventListener("DOMContentLoaded", function() {
  // Make functions globally accessible
  window.initializeMap = initializeMap;
  window.showCourtDetails = showCourtDetails;

  // Check if the quick join overlay is visible
  const quickJoinOverlay = document.getElementById("quick-join-overlay");
  if (quickJoinOverlay && quickJoinOverlay.style.display !== "none") {
    initializeMap();
    setupEventListeners();
    generateCourtCards();

    // Initialize layout
    const sidebar = document.getElementById("court-sidebar");
    if (sidebar && sidebar.classList.contains("active")) {
      adjustMapLayout();
    }
  } else {
    // Set up a mutation observer to initialize the map when the overlay becomes visible
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === "style" &&
            quickJoinOverlay.style.display !== "none") {
          initializeMap();
          setupEventListeners();
          generateCourtCards();
          observer.disconnect();
        }
      });
    });

    if (quickJoinOverlay) {
      observer.observe(quickJoinOverlay, { attributes: true });
    }

    // Also set up event listeners regardless
    setupEventListeners();
  }
});

/**
 * Initialize the map with basketball court markers
 */
function initializeMap() {
  const mapContainer = document.querySelector('.map-container');
  const map = L.map('map').setView([9.7870, 118.7400], 13);

  // Add the tile layer for the map with a light style
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);

  // Add markers for each basketball court
  for (const key in basketballCourts) {
    const court = basketballCourts[key];

    // Choose marker color based on court status
    const markerColor = court.status === 'available' ? 'green' : 'red';
    const markerUrl = `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${markerColor}.png`;

    const marker = L.marker(court.coords, {
      icon: L.icon({
        iconUrl: markerUrl,
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    }).addTo(map)
    .bindTooltip(court.name, {permanent: false, direction: 'top'})
    .on("click", () => {
      showCourtDetails(court);
    });
  }

  // Remove loading indicator after map is loaded
  map.whenReady(() => {
    setTimeout(() => {
      if (mapContainer) {
        mapContainer.classList.add('loaded');
      }
    }, 500); // Short delay for smoother transition
  });

  // Add map control event listeners
  document.getElementById('zoom-in').addEventListener('click', () => {
    map.zoomIn();
  });

  document.getElementById('zoom-out').addEventListener('click', () => {
    map.zoomOut();
  });

  document.getElementById('my-location').addEventListener('click', () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        map.setView([position.coords.latitude, position.coords.longitude], 15);
      });
    }
  });
}

/**
 * Set up event listeners for the UI
 */
function setupEventListeners() {
  // Search functionality
  const searchInput = document.getElementById("search-barangay");
  searchInput.addEventListener("input", function() {
    searchBasketballCourts(this.value);
  });

  // Filter chips functionality
  const filterChips = document.querySelectorAll(".filter-chip");
  filterChips.forEach(chip => {
    chip.addEventListener("click", function() {
      // Remove active class from all chips
      filterChips.forEach(c => c.classList.remove("active"));

      // Add active class to clicked chip
      this.classList.add("active");

      // Apply filter based on data-filter attribute
      const filterType = this.getAttribute("data-filter");
      filterCourtsByType(filterType);
    });
  });

  // Toggle sidebar
  document.getElementById("toggle-sidebar").addEventListener("click", function() {
    document.getElementById("court-sidebar").classList.toggle("active");
    adjustMapLayout();
  });

  // Close sidebar
  document.getElementById("close-sidebar").addEventListener("click", function() {
    document.getElementById("court-sidebar").classList.remove("active");
    adjustMapLayout();
  });

  // Function to adjust map layout when sidebar is toggled - made globally accessible
  window.adjustMapLayout = function() {
    const sidebar = document.getElementById("court-sidebar");
    const mapContainer = document.querySelector(".map-container");
    const mainContent = document.querySelector(".main-content");
    const quickJoinContainer = document.querySelector(".quick-join-container");

    if (sidebar && sidebar.classList.contains("active")) {
      // When sidebar is active, adjust the main content
      if (mainContent) mainContent.style.marginRight = "380px";

      // Make sure the map redraws correctly
      setTimeout(() => {
        // Trigger a resize event to make the map redraw itself
        window.dispatchEvent(new Event('resize'));
      }, 300);
    } else {
      // When sidebar is closed, reset the main content
      if (mainContent) mainContent.style.marginRight = "0";

      // Make sure the map redraws correctly
      setTimeout(() => {
        // Trigger a resize event to make the map redraw itself
        window.dispatchEvent(new Event('resize'));
      }, 300);
    }
  }

  // Local reference to the global function
  const adjustMapLayout = window.adjustMapLayout;

  // Back button
  document.getElementById("close-quick-join").addEventListener("click", function() {
    document.getElementById("quick-join-overlay").style.display = "none";
  });

  // Tab switching
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach(button => {
    button.addEventListener("click", function() {
      // Remove active class from all tabs
      tabButtons.forEach(btn => btn.classList.remove("active"));
      document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active"));

      // Add active class to clicked tab
      this.classList.add("active");
      const tabId = this.getAttribute("data-tab") + "-tab";
      document.getElementById(tabId).classList.add("active");
    });
  });

  // Join game button
  const joinGameBtn = document.querySelector(".join-game-btn");
  if (joinGameBtn) {
    joinGameBtn.addEventListener("click", function() {
      // Show success message
      this.innerHTML = "JOINED! <i class='bi bi-check-circle-fill'></i>";
      this.style.backgroundColor = "#4CAF50";

      // Reset after 2 seconds
      setTimeout(() => {
        this.innerHTML = "JOIN NEXT GAME";
        this.style.backgroundColor = "#AD2831";
      }, 2000);

      alert("You've joined the next available basketball game! A confirmation has been sent to your phone.");
    });
  }

  // Create game button
  const createGameBtn = document.querySelector(".create-game-btn");
  if (createGameBtn) {
    createGameBtn.addEventListener("click", function() {
      alert("Create game form will be displayed here. This feature is coming soon!");
    });
  }

  // Directions button
  const directionsBtn = document.querySelector(".directions-btn");
  if (directionsBtn) {
    directionsBtn.addEventListener("click", function() {
      alert("Opening directions to this court in your maps app.");
    });
  }
}

/**
 * Generate court cards for the list view
 */
function generateCourtCards() {
  const container = document.getElementById("court-cards-container");
  container.innerHTML = '';

  for (const key in basketballCourts) {
    const court = basketballCourts[key];

    const card = document.createElement("div");
    card.className = "court-card";
    card.innerHTML = `
      <div class="court-card-image">
        <img src="${court.image}" alt="${court.name}">
        <div class="court-card-status">
          <span class="status-dot ${court.status}"></span>
          ${court.status === 'available' ? 'Available' : 'Busy'}
        </div>
      </div>
      <div class="court-card-content">
        <div class="court-card-title">${court.name}</div>
        <div class="court-card-location">
          <i class="bi bi-geo-alt"></i> ${court.barangay}
        </div>
        <div class="court-card-info">
          <div class="court-card-players">
            <i class="bi bi-people"></i> ${court.currentPlayers}
          </div>
          <div class="court-card-rating">
            <i class="bi bi-star-fill"></i> ${court.rating.split('/')[0]}
          </div>
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      showCourtDetails(court);
    });

    container.appendChild(card);
  }
}

/**
 * Search for basketball courts by name or barangay
 * @param {string} query - Search query
 */
function searchBasketballCourts(query) {
  query = query.toLowerCase().trim();

  // If query is empty, show all courts
  if (!query) {
    generateCourtCards();
    return;
  }

  // Filter courts based on query
  const container = document.getElementById("court-cards-container");
  container.innerHTML = '';

  for (const key in basketballCourts) {
    const court = basketballCourts[key];
    if (court.name.toLowerCase().includes(query) ||
        court.barangay.toLowerCase().includes(query)) {

      const card = document.createElement("div");
      card.className = "court-card";
      card.innerHTML = `
        <div class="court-card-image">
          <img src="${court.image}" alt="${court.name}">
          <div class="court-card-status">
            <span class="status-dot ${court.status}"></span>
            ${court.status === 'available' ? 'Available' : 'Busy'}
          </div>
        </div>
        <div class="court-card-content">
          <div class="court-card-title">${court.name}</div>
          <div class="court-card-location">
            <i class="bi bi-geo-alt"></i> ${court.barangay}
          </div>
          <div class="court-card-info">
            <div class="court-card-players">
              <i class="bi bi-people"></i> ${court.currentPlayers}
            </div>
            <div class="court-card-rating">
              <i class="bi bi-star-fill"></i> ${court.rating.split('/')[0]}
            </div>
          </div>
        </div>
      `;

      card.addEventListener("click", () => {
        showCourtDetails(court);
      });

      container.appendChild(card);
    }
  }
}

/**
 * Filter courts by type (all, available, nearby)
 * @param {string} filterType - Type of filter to apply
 */
function filterCourtsByType(filterType) {
  const container = document.getElementById("court-cards-container");
  container.innerHTML = '';

  // Reset search input when using filters
  const searchInput = document.getElementById("search-barangay");
  if (searchInput) {
    searchInput.value = '';
  }

  for (const key in basketballCourts) {
    const court = basketballCourts[key];
    let shouldShow = false;

    switch(filterType) {
      case 'all':
        shouldShow = true;
        break;
      case 'available':
        shouldShow = court.status === 'available';
        break;
      case 'nearby':
        // For demo purposes, we'll consider courts with "distance" property as nearby
        // In a real app, this would use geolocation to calculate actual distances
        shouldShow = true; // Show all for now, but you could filter by distance
        break;
    }

    if (shouldShow) {
      const card = document.createElement("div");
      card.className = "court-card";
      card.innerHTML = `
        <div class="court-card-image">
          <img src="${court.image}" alt="${court.name}">
          <div class="court-card-status">
            <span class="status-dot ${court.status}"></span>
            ${court.status === 'available' ? 'Available' : 'Busy'}
          </div>
        </div>
        <div class="court-card-content">
          <div class="court-card-title">${court.name}</div>
          <div class="court-card-location">
            <i class="bi bi-geo-alt"></i> ${court.barangay}
          </div>
          <div class="court-card-info">
            <div class="court-card-players">
              <i class="bi bi-people"></i> ${court.currentPlayers}
            </div>
            <div class="court-card-rating">
              <i class="bi bi-star-fill"></i> ${court.rating.split('/')[0]}
            </div>
          </div>
        </div>
      `;

      card.addEventListener("click", () => {
        showCourtDetails(court);
      });

      container.appendChild(card);
    }
  }
}

/**
 * Display basketball court details in the sidebar
 * @param {Object} court - Basketball court data
 */
function showCourtDetails(court) {
  // Get sidebar element
  const sidebar = document.getElementById("court-sidebar");

  // Add loading state
  sidebar.classList.add("loading");

  // Show the sidebar
  sidebar.classList.add("active");

  // Adjust layout for sidebar
  adjustMapLayout();

  // Small delay for smoother animation
  setTimeout(() => {
    // Set court image and basic info
    document.getElementById("court-image").src = court.image;
    document.getElementById("barangay-name").innerText = court.barangay;
    document.getElementById("court-name").innerText = court.name;

    // Remove loading state after content is loaded
    sidebar.classList.remove("loading");
  }, 300);

  // Set court status
  const statusIndicator = document.querySelector(".status-indicator");
  statusIndicator.className = `status-indicator ${court.status}`;
  statusIndicator.innerHTML = `<i class="bi bi-circle-fill"></i> ${court.status === 'available' ? 'OPEN NOW' : 'BUSY NOW'}`;

  // Set court details
  document.getElementById("current-players").innerText = court.currentPlayers;
  document.getElementById("court-hours").innerText = court.hours;
  document.getElementById("court-rating").innerText = court.rating;

  // Set court features
  const amenitiesList = document.getElementById("amenities-list");
  amenitiesList.innerHTML = '';
  court.features.forEach(feature => {
    const amenityItem = document.createElement("div");
    amenityItem.className = "amenity-item";
    amenityItem.innerHTML = `<i class="bi bi-check-circle-fill"></i> ${feature}`;
    amenitiesList.appendChild(amenityItem);
  });

  // Set scheduled games
  const gamesList = document.getElementById("games-list");
  gamesList.innerHTML = '';

  if (court.games.length === 0) {
    const noGamesItem = document.createElement("li");
    noGamesItem.innerHTML = `<div class="game-item">No scheduled games</div>`;
    gamesList.appendChild(noGamesItem);
  } else {
    court.games.forEach(game => {
      const gameItem = document.createElement("li");
      gameItem.innerHTML = `
        <div class="game-item">
          <div class="game-header">
            <div class="date">${game.date}</div>
            <div class="game-type">${game.type}</div>
          </div>
          <div class="game-details">
            <div class="players-needed">${game.playersNeeded}</div>
            <div class="skill-level">${game.skillLevel}</div>
          </div>
        </div>
      `;
      gamesList.appendChild(gameItem);
    });
  }

  // Set reviews
  const reviewsList = document.getElementById("reviews-list");
  reviewsList.innerHTML = '';

  if (court.reviews.length === 0) {
    reviewsList.innerHTML = '<div class="review-item">No reviews yet</div>';
  } else {
    court.reviews.forEach(review => {
      const reviewItem = document.createElement("div");
      reviewItem.className = "review-item";
      reviewItem.innerHTML = `
        <div class="review-header">
          <div class="reviewer">${review.reviewer}</div>
          <div class="review-rating">${review.rating}</div>
        </div>
        <div class="review-text">${review.text}</div>
        <div class="review-date">${review.date}</div>
      `;
      reviewsList.appendChild(reviewItem);
    });
  }
}
