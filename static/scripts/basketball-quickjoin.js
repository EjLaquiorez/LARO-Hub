/**
 * LARO Basketball Quick Join
 * Enhanced functionality for basketball court quick join feature
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
    ]
  }
};

document.addEventListener("DOMContentLoaded", function() {
  initializeMap();
  setupEventListeners();
});

/**
 * Initialize the map with basketball court markers
 */
function initializeMap() {
  const map = L.map('map').setView([9.7870, 118.7400], 13);

  // Add the tile layer for the map with a darker style for better contrast
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
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
      showBasketballCourtInfo(court);
    });
  }
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

  // Close button
  document.querySelector(".close-tab").addEventListener("click", toggleCourtInfo);

  // Back button
  document.getElementById("close-quick-join").addEventListener("click", function() {
    document.getElementById("quick-join-overlay").style.display = "none";
  });

  // Join game button
  const joinGameBtn = document.querySelector(".join-game-btn");
  if (joinGameBtn) {
    joinGameBtn.addEventListener("click", function() {
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
}

/**
 * Search for basketball courts by name or barangay
 * @param {string} query - Search query
 */
function searchBasketballCourts(query) {
  query = query.toLowerCase().trim();

  // If query is empty, no filtering needed
  if (!query) return;

  // Filter courts based on query
  const filteredCourts = Object.keys(basketballCourts).filter(key => {
    const court = basketballCourts[key];
    return court.name.toLowerCase().includes(query) ||
           court.barangay.toLowerCase().includes(query);
  });

  // If we have results, show the first one
  if (filteredCourts.length > 0) {
    showBasketballCourtInfo(basketballCourts[filteredCourts[0]]);
  }
}

/**
 * Display basketball court information in the sidebar
 * @param {Object} court - Basketball court data
 */
function showBasketballCourtInfo(court) {
  // Set basic court info
  document.getElementById("court-name").innerText = court.name;
  document.getElementById("court-image").src = court.image;
  document.getElementById("barangay-name").innerText = court.barangay;

  // Set enhanced basketball details
  document.getElementById("current-players").innerText = court.currentPlayers;
  document.getElementById("court-hours").innerText = court.hours;
  document.getElementById("court-rating").innerText = court.rating;

  // Set court features/amenities
  const amenitiesList = document.querySelector(".amenities-list");
  if (amenitiesList) {
    amenitiesList.innerHTML = '';
    court.features.forEach(feature => {
      const amenityItem = document.createElement("div");
      amenityItem.className = "amenity-item";
      amenityItem.innerHTML = `<i class="bi bi-check-circle-fill"></i> ${feature}`;
      amenitiesList.appendChild(amenityItem);
    });
  }

  // Set scheduled games
  const gamesList = document.querySelector(".scheduled-games ul");
  if (gamesList) {
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
  }

  // Show the court info sidebar
  document.getElementById("court-info-tab").classList.remove("collapsed");
}

/**
 * Toggle the court info sidebar visibility
 */
function toggleCourtInfo() {
  const courtInfoTab = document.getElementById("court-info-tab");
  courtInfoTab.classList.toggle("collapsed");
}
