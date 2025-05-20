/**
 * LARO Basketball Quick Join - Sidebar Implementation
 * Enhanced functionality for basketball court finder with sidebar layout
 */

// Import services
import authService from './auth-service.js';
import apiService from './api-service.js';
import courtService from './court-service.js';
import gameService from './game-service.js';

document.addEventListener("DOMContentLoaded", function() {
  // Make functions globally accessible
  window.initializeMap = initializeMap;
  window.showCourtDetails = showCourtDetails;
  window.generateCourtCards = generateCourtCards;

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
async function initializeMap() {
  const mapContainer = document.querySelector('.map-container');
  const map = L.map('map').setView([9.7870, 118.7400], 13);

  // Add the tile layer for the map with a light style
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);

  try {
    // Fetch courts from the API
    const courts = await courtService.getCourts();

    // If no courts were found, use the courts from the dashboard
    if (!courts || courts.length === 0) {
      // Try to get courts from the dashboard
      if (window.basketballCourts && Object.keys(window.basketballCourts).length > 0) {
        addCourtsToMap(window.basketballCourts, map);
      } else {
        // Show a message that no courts were found
        const noCourtMessage = L.popup()
          .setLatLng([9.7870, 118.7400])
          .setContent("No basketball courts found. Please add courts to the system.")
          .openOn(map);
      }
    } else {
      // Process courts into the format expected by the map
      const formattedCourts = {};

      courts.forEach(court => {
        const courtKey = court.name.toLowerCase().replace(/\s+/g, '_');

        // Extract barangay from location if available
        const locationParts = court.location ? court.location.split(',') : [];
        const barangay = locationParts.length > 1 ? locationParts[0].trim() : 'Unknown';

        // Default coordinates if none provided
        const defaultCoords = [
          9.7870 + (Math.random() * 0.02 - 0.01), // Random offset from center
          118.7400 + (Math.random() * 0.02 - 0.01) // Random offset from center
        ];

        formattedCourts[courtKey] = {
          id: court.id,
          coords: court.coords || defaultCoords,
          name: court.name,
          barangay: barangay,
          image: court.image,
          currentPlayers: court.currentPlayers || "0/10",
          hours: court.availability || "Open 24 Hours",
          rating: court.rating || "New",
          features: court.features || ["Basketball Court"],
          status: court.status || "available",
          distance: court.distance || "Unknown",
          rental_fee: court.rental_fee
        };
      });

      // Add the courts to the map
      addCourtsToMap(formattedCourts, map);
    }
  } catch (error) {
    console.error('Error fetching courts for map:', error);

    // Try to get courts from the dashboard
    if (window.basketballCourts && Object.keys(window.basketballCourts).length > 0) {
      addCourtsToMap(window.basketballCourts, map);
    } else {
      // Show an error message
      const errorMessage = L.popup()
        .setLatLng([9.7870, 118.7400])
        .setContent("Error loading basketball courts. Please try again later.")
        .openOn(map);
    }
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
 * Add courts to the map
 * @param {Object} courts - Basketball courts data
 * @param {Object} map - Leaflet map object
 */
function addCourtsToMap(courts, map) {
  // Add markers for each basketball court
  for (const key in courts) {
    const court = courts[key];

    // Skip courts without coordinates
    if (!court.coords || court.coords.length !== 2) {
      console.warn(`Court ${court.name} has invalid coordinates:`, court.coords);
      continue;
    }

    // Choose marker color based on court status
    const markerColor = court.status === 'busy' ? 'red' : 'green';
    const markerUrl = `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${markerColor}.png`;

    try {
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
    } catch (error) {
      console.error(`Error adding marker for court ${court.name}:`, error);
    }
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

  // Add Court button
  const addCourtBtn = document.getElementById("add-court-btn");
  if (addCourtBtn) {
    // Check if user is authenticated
    const isAuthenticated = authService.isAuthenticated();

    // Show/hide add court button based on authentication
    if (!isAuthenticated) {
      addCourtBtn.style.display = 'none';
    } else {
      addCourtBtn.addEventListener("click", function() {
        const addCourtModal = document.getElementById("add-court-modal");
        if (addCourtModal) {
          addCourtModal.style.display = "flex";
        }
      });
    }
  }

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
async function generateCourtCards() {
  const container = document.getElementById("court-cards-container");
  if (!container) return;

  // Show loading state
  container.innerHTML = '<div class="loading-courts">Loading courts...</div>';

  try {
    // Fetch courts from the API
    const courts = await courtService.getCourts();

    // Clear loading state
    container.innerHTML = '';

    // If no courts were found, show a message
    if (!courts || courts.length === 0) {
      container.innerHTML = '<div class="no-courts">No basketball courts found</div>';
      return;
    }

    // Create a card for each court
    courts.forEach(court => {
      // Extract barangay from location if available
      const locationParts = court.location ? court.location.split(',') : [];
      const barangay = locationParts.length > 1 ? locationParts[0].trim() : 'Unknown';

      // Default image if none provided
      const defaultImages = [
        "https://images.unsplash.com/photo-1505666287802-931dc83a0fe4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFza2V0YmFsbCUyMGNvdXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmFza2V0YmFsbCUyMGNvdXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1627627256672-027a4613d028?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YmFza2V0YmFsbCUyMGNvdXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
      ];
      const randomImage = defaultImages[Math.floor(Math.random() * defaultImages.length)];

      const card = document.createElement("div");
      card.className = "court-card";
      card.dataset.courtId = court.id;

      // Add status class (default to available)
      const status = court.status || 'available';
      card.classList.add(status);

      card.innerHTML = `
        <div class="court-card-image">
          <img src="${court.image || randomImage}" alt="${court.name}">
          <div class="court-card-status">
            <span class="status-dot ${status}"></span>
            ${status === 'busy' ? 'Busy' : 'Available'}
          </div>
        </div>
        <div class="court-card-content">
          <div class="court-card-title">${court.name}</div>
          <div class="court-card-location">
            <i class="bi bi-geo-alt"></i> ${barangay}
          </div>
          <div class="court-card-info">
            <div class="court-card-players">
              <i class="bi bi-people"></i> ${court.currentPlayers || '0/10'}
            </div>
            <div class="court-card-rating">
              <i class="bi bi-star-fill"></i> ${court.rating ? court.rating.split('/')[0] : 'New'}
            </div>
          </div>
        </div>
      `;

      // Create a court object with all the necessary properties
      const courtObj = {
        id: court.id,
        name: court.name,
        barangay: barangay,
        image: court.image || randomImage,
        currentPlayers: court.currentPlayers || '0/10',
        hours: court.availability || 'Open 24 Hours',
        rating: court.rating || 'New',
        features: court.features || ['Basketball Court'],
        status: status,
        distance: court.distance || 'Unknown',
        rental_fee: court.rental_fee
      };

      card.addEventListener("click", () => {
        // Remove active class from all cards
        document.querySelectorAll(".court-card").forEach(c => c.classList.remove("active"));

        // Add active class to this card
        card.classList.add("active");

        // Show court details
        showCourtDetails(courtObj);
      });

      container.appendChild(card);
    });
  } catch (error) {
    console.error('Error generating court cards:', error);

    // Show error message
    container.innerHTML = '<div class="error-courts">Error loading courts. Please try again later.</div>';

    // Try to use courts from the dashboard as fallback
    if (window.basketballCourts && Object.keys(window.basketballCourts).length > 0) {
      setTimeout(() => {
        container.innerHTML = '';

        for (const key in window.basketballCourts) {
          const court = window.basketballCourts[key];

          const card = document.createElement("div");
          card.className = "court-card";
          card.classList.add(court.status);

          card.innerHTML = `
            <div class="court-card-image">
              <img src="${court.image}" alt="${court.name}">
              <div class="court-card-status">
                <span class="status-dot ${court.status}"></span>
                ${court.status === 'busy' ? 'Busy' : 'Available'}
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
            // Remove active class from all cards
            document.querySelectorAll(".court-card").forEach(c => c.classList.remove("active"));

            // Add active class to this card
            card.classList.add("active");

            // Show court details
            showCourtDetails(court);
          });

          container.appendChild(card);
        }
      }, 1000);
    }
  }
}

/**
 * Search for basketball courts by name or barangay
 * @param {string} query - Search query
 */
async function searchBasketballCourts(query) {
  query = query.toLowerCase().trim();

  // If query is empty, show all courts
  if (!query) {
    generateCourtCards();
    return;
  }

  // Show loading state
  const container = document.getElementById("court-cards-container");
  if (!container) return;

  container.innerHTML = '<div class="loading-courts">Searching courts...</div>';

  try {
    // Fetch courts from the API with search query
    const courts = await courtService.getCourts(query);

    // Clear loading state
    container.innerHTML = '';

    // If no courts were found, show a message
    if (!courts || courts.length === 0) {
      container.innerHTML = '<div class="no-courts">No basketball courts found matching your search</div>';
      return;
    }

    // Create a card for each court
    courts.forEach(court => {
      // Extract barangay from location if available
      const locationParts = court.location ? court.location.split(',') : [];
      const barangay = locationParts.length > 1 ? locationParts[0].trim() : 'Unknown';

      // Default image if none provided
      const defaultImages = [
        "https://images.unsplash.com/photo-1505666287802-931dc83a0fe4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFza2V0YmFsbCUyMGNvdXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmFza2V0YmFsbCUyMGNvdXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1627627256672-027a4613d028?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YmFza2V0YmFsbCUyMGNvdXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
      ];
      const randomImage = defaultImages[Math.floor(Math.random() * defaultImages.length)];

      const card = document.createElement("div");
      card.className = "court-card";
      card.dataset.courtId = court.id;

      // Add status class (default to available)
      const status = court.status || 'available';
      card.classList.add(status);

      card.innerHTML = `
        <div class="court-card-image">
          <img src="${court.image || randomImage}" alt="${court.name}">
          <div class="court-card-status">
            <span class="status-dot ${status}"></span>
            ${status === 'busy' ? 'Busy' : 'Available'}
          </div>
        </div>
        <div class="court-card-content">
          <div class="court-card-title">${court.name}</div>
          <div class="court-card-location">
            <i class="bi bi-geo-alt"></i> ${barangay}
          </div>
          <div class="court-card-info">
            <div class="court-card-players">
              <i class="bi bi-people"></i> ${court.currentPlayers || '0/10'}
            </div>
            <div class="court-card-rating">
              <i class="bi bi-star-fill"></i> ${court.rating ? court.rating.split('/')[0] : 'New'}
            </div>
          </div>
        </div>
      `;

      // Create a court object with all the necessary properties
      const courtObj = {
        id: court.id,
        name: court.name,
        barangay: barangay,
        image: court.image || randomImage,
        currentPlayers: court.currentPlayers || '0/10',
        hours: court.availability || 'Open 24 Hours',
        rating: court.rating || 'New',
        features: court.features || ['Basketball Court'],
        status: status,
        distance: court.distance || 'Unknown',
        rental_fee: court.rental_fee
      };

      card.addEventListener("click", () => {
        // Remove active class from all cards
        document.querySelectorAll(".court-card").forEach(c => c.classList.remove("active"));

        // Add active class to this card
        card.classList.add("active");

        // Show court details
        showCourtDetails(courtObj);
      });

      container.appendChild(card);
    });
  } catch (error) {
    console.error('Error searching courts:', error);

    // Show error message
    container.innerHTML = '<div class="error-courts">Error searching courts. Please try again later.</div>';

    // Try to use courts from the dashboard as fallback
    if (window.basketballCourts && Object.keys(window.basketballCourts).length > 0) {
      setTimeout(() => {
        container.innerHTML = '';

        // Filter courts based on query
        for (const key in window.basketballCourts) {
          const court = window.basketballCourts[key];
          if (court.name.toLowerCase().includes(query) ||
              court.barangay.toLowerCase().includes(query)) {

            const card = document.createElement("div");
            card.className = "court-card";
            card.classList.add(court.status);

            card.innerHTML = `
              <div class="court-card-image">
                <img src="${court.image}" alt="${court.name}">
                <div class="court-card-status">
                  <span class="status-dot ${court.status}"></span>
                  ${court.status === 'busy' ? 'Busy' : 'Available'}
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
              // Remove active class from all cards
              document.querySelectorAll(".court-card").forEach(c => c.classList.remove("active"));

              // Add active class to this card
              card.classList.add("active");

              // Show court details
              showCourtDetails(court);
            });

            container.appendChild(card);
          }
        }

        // If no courts were found, show a message
        if (container.children.length === 0) {
          container.innerHTML = '<div class="no-courts">No basketball courts found matching your search</div>';
        }
      }, 1000);
    }
  }
}

/**
 * Filter courts by type (all, available, nearby)
 * @param {string} filterType - Type of filter to apply
 */
async function filterCourtsByType(filterType) {
  const container = document.getElementById("court-cards-container");
  if (!container) return;

  // Show loading state
  container.innerHTML = '<div class="loading-courts">Filtering courts...</div>';

  // Reset search input when using filters
  const searchInput = document.getElementById("search-barangay");
  if (searchInput) {
    searchInput.value = '';
  }

  try {
    // Fetch courts from the API
    let courts = await courtService.getCourts();

    // Clear loading state
    container.innerHTML = '';

    // If no courts were found, show a message
    if (!courts || courts.length === 0) {
      container.innerHTML = '<div class="no-courts">No basketball courts found</div>';
      return;
    }

    // Filter courts based on the filter type
    if (filterType === 'available') {
      courts = courts.filter(court => court.status !== 'busy');
    } else if (filterType === 'nearby') {
      // For a real implementation, this would use geolocation
      // For now, we'll just show all courts
      try {
        // Try to get the user's location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            try {
              // This would be implemented in a future version
              // courts = await courtService.getNearbyCourtsByCoordinates(
              //   position.coords.latitude,
              //   position.coords.longitude
              // );
              // For now, just use all courts
            } catch (error) {
              console.error('Error getting nearby courts:', error);
            }
          });
        }
      } catch (error) {
        console.error('Error getting user location:', error);
      }
    }

    // If no courts match the filter, show a message
    if (!courts || courts.length === 0) {
      container.innerHTML = '<div class="no-courts">No basketball courts match the selected filter</div>';
      return;
    }

    // Create a card for each court
    courts.forEach(court => {
      // Extract barangay from location if available
      const locationParts = court.location ? court.location.split(',') : [];
      const barangay = locationParts.length > 1 ? locationParts[0].trim() : 'Unknown';

      // Default image if none provided
      const defaultImages = [
        "https://images.unsplash.com/photo-1505666287802-931dc83a0fe4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFza2V0YmFsbCUyMGNvdXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmFza2V0YmFsbCUyMGNvdXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1627627256672-027a4613d028?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YmFza2V0YmFsbCUyMGNvdXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
      ];
      const randomImage = defaultImages[Math.floor(Math.random() * defaultImages.length)];

      const card = document.createElement("div");
      card.className = "court-card";
      card.dataset.courtId = court.id;

      // Add status class (default to available)
      const status = court.status || 'available';
      card.classList.add(status);

      card.innerHTML = `
        <div class="court-card-image">
          <img src="${court.image || randomImage}" alt="${court.name}">
          <div class="court-card-status">
            <span class="status-dot ${status}"></span>
            ${status === 'busy' ? 'Busy' : 'Available'}
          </div>
        </div>
        <div class="court-card-content">
          <div class="court-card-title">${court.name}</div>
          <div class="court-card-location">
            <i class="bi bi-geo-alt"></i> ${barangay}
          </div>
          <div class="court-card-info">
            <div class="court-card-players">
              <i class="bi bi-people"></i> ${court.currentPlayers || '0/10'}
            </div>
            <div class="court-card-rating">
              <i class="bi bi-star-fill"></i> ${court.rating ? court.rating.split('/')[0] : 'New'}
            </div>
          </div>
        </div>
      `;

      // Create a court object with all the necessary properties
      const courtObj = {
        id: court.id,
        name: court.name,
        barangay: barangay,
        image: court.image || randomImage,
        currentPlayers: court.currentPlayers || '0/10',
        hours: court.availability || 'Open 24 Hours',
        rating: court.rating || 'New',
        features: court.features || ['Basketball Court'],
        status: status,
        distance: court.distance || 'Unknown',
        rental_fee: court.rental_fee
      };

      card.addEventListener("click", () => {
        // Remove active class from all cards
        document.querySelectorAll(".court-card").forEach(c => c.classList.remove("active"));

        // Add active class to this card
        card.classList.add("active");

        // Show court details
        showCourtDetails(courtObj);
      });

      container.appendChild(card);
    });
  } catch (error) {
    console.error('Error filtering courts:', error);

    // Show error message
    container.innerHTML = '<div class="error-courts">Error filtering courts. Please try again later.</div>';

    // Try to use courts from the dashboard as fallback
    if (window.basketballCourts && Object.keys(window.basketballCourts).length > 0) {
      setTimeout(() => {
        container.innerHTML = '';

        // Filter courts based on the filter type
        for (const key in window.basketballCourts) {
          const court = window.basketballCourts[key];
          let shouldShow = false;

          switch(filterType) {
            case 'all':
              shouldShow = true;
              break;
            case 'available':
              shouldShow = court.status === 'available';
              break;
            case 'nearby':
              // For demo purposes, we'll consider all courts as nearby
              shouldShow = true;
              break;
          }

          if (shouldShow) {
            const card = document.createElement("div");
            card.className = "court-card";
            card.classList.add(court.status);

            card.innerHTML = `
              <div class="court-card-image">
                <img src="${court.image}" alt="${court.name}">
                <div class="court-card-status">
                  <span class="status-dot ${court.status}"></span>
                  ${court.status === 'busy' ? 'Busy' : 'Available'}
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
              // Remove active class from all cards
              document.querySelectorAll(".court-card").forEach(c => c.classList.remove("active"));

              // Add active class to this card
              card.classList.add("active");

              // Show court details
              showCourtDetails(court);
            });

            container.appendChild(card);
          }
        }

        // If no courts match the filter, show a message
        if (container.children.length === 0) {
          container.innerHTML = '<div class="no-courts">No basketball courts match the selected filter</div>';
        }
      }, 1000);
    }
  }
}

/**
 * Display basketball court details in the sidebar
 * @param {Object} court - Basketball court data
 */
async function showCourtDetails(court) {
  // Get sidebar element
  const sidebar = document.getElementById("court-sidebar");

  // Add loading state
  sidebar.classList.add("loading");

  // Show the sidebar
  sidebar.classList.add("active");

  // Adjust layout for sidebar
  adjustMapLayout();

  try {
    // If we have a court ID but not full details, fetch the details
    if (court.id && !court.features) {
      try {
        const courtDetails = await courtService.getCourtById(court.id);
        if (courtDetails) {
          // Merge the details with the court object
          Object.assign(court, courtDetails);
        }
      } catch (error) {
        console.error('Error fetching court details:', error);
      }
    }

    // Small delay for smoother animation
    setTimeout(() => {
      // Set court image and basic info
      document.getElementById("court-image").src = court.image;
      document.getElementById("barangay-name").innerText = court.barangay || 'Unknown';
      document.getElementById("court-name").innerText = court.name;

      // Remove loading state after content is loaded
      sidebar.classList.remove("loading");
    }, 300);

    // Set court status
    const statusIndicator = document.querySelector(".status-indicator");
    statusIndicator.className = `status-indicator ${court.status || 'available'}`;
    statusIndicator.innerHTML = `<i class="bi bi-circle-fill"></i> ${court.status === 'busy' ? 'BUSY NOW' : 'OPEN NOW'}`;

    // Set court details
    document.getElementById("current-players").innerText = court.currentPlayers || '0/10';
    document.getElementById("court-hours").innerText = court.hours || court.availability || 'Open 24 Hours';
    document.getElementById("court-rating").innerText = court.rating || 'New';

    // Set court features
    const amenitiesList = document.getElementById("amenities-list");
    amenitiesList.innerHTML = '';

    // Default features if none provided
    const features = court.features || ['Basketball Court'];

    features.forEach(feature => {
      const amenityItem = document.createElement("div");
      amenityItem.className = "amenity-item";
      amenityItem.innerHTML = `<i class="bi bi-check-circle-fill"></i> ${feature}`;
      amenitiesList.appendChild(amenityItem);
    });

    // Add rental fee if available
    if (court.rental_fee) {
      const rentalItem = document.createElement("div");
      rentalItem.className = "amenity-item rental-fee";
      rentalItem.innerHTML = `<i class="bi bi-cash"></i> Rental Fee: ${court.rental_fee}`;
      amenitiesList.appendChild(rentalItem);
    }

    // Try to fetch games for this court
    let games = [];
    try {
      if (court.id) {
        games = await gameService.getGamesByCourt(court.id);
      }
    } catch (error) {
      console.error('Error fetching games for court:', error);
      // Use sample games if available
      games = court.games || [];
    }

    // Set scheduled games
    const gamesList = document.getElementById("games-list");
    gamesList.innerHTML = '';

    if (!games || games.length === 0) {
      const noGamesItem = document.createElement("li");
      noGamesItem.innerHTML = `<div class="game-item">No scheduled games</div>`;
      gamesList.appendChild(noGamesItem);
    } else {
      games.forEach(game => {
        const gameItem = document.createElement("li");

        // Format game data based on what's available
        const gameDate = game.date ? game.date : 'Date TBD';
        const gameType = game.type || game.game_type || '5v5 Full Court';
        const playersNeeded = game.playersNeeded || 'Players needed';
        const skillLevel = game.skillLevel || 'All Levels';

        gameItem.innerHTML = `
          <div class="game-item">
            <div class="game-header">
              <div class="date">${gameDate}</div>
              <div class="game-type">${gameType}</div>
            </div>
            <div class="game-details">
              <div class="players-needed">${playersNeeded}</div>
              <div class="skill-level">${skillLevel}</div>
            </div>
          </div>
        `;
        gamesList.appendChild(gameItem);
      });
    }

    // Try to fetch reviews for this court
    let reviews = [];
    try {
      if (court.id) {
        // This would be implemented in a future API
        // reviews = await courtService.getCourtReviews(court.id);
      }
    } catch (error) {
      console.error('Error fetching reviews for court:', error);
      // Use sample reviews if available
      reviews = court.reviews || [];
    }

    // Set reviews
    const reviewsList = document.getElementById("reviews-list");
    reviewsList.innerHTML = '';

    if (!reviews || reviews.length === 0) {
      reviewsList.innerHTML = '<div class="review-item">No reviews yet</div>';
    } else {
      reviews.forEach(review => {
        const reviewItem = document.createElement("div");
        reviewItem.className = "review-item";

        // Format review data based on what's available
        const reviewer = review.reviewer || 'Anonymous';
        const rating = review.rating || '★★★☆☆';
        const text = review.text || 'No comment provided';
        const date = review.date || 'Recently';

        reviewItem.innerHTML = `
          <div class="review-header">
            <div class="reviewer">${reviewer}</div>
            <div class="review-rating">${rating}</div>
          </div>
          <div class="review-text">${text}</div>
          <div class="review-date">${date}</div>
        `;
        reviewsList.appendChild(reviewItem);
      });
    }
  } catch (error) {
    console.error('Error displaying court details:', error);

    // Show error message in sidebar
    sidebar.innerHTML = `
      <div class="sidebar-header">
        <div class="sidebar-title">
          <i class="bi bi-info-circle"></i>
          <h2>COURT DETAILS</h2>
        </div>
        <button class="close-sidebar" id="close-sidebar" title="Close Details">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <div class="sidebar-content">
        <div class="error-message">
          <i class="bi bi-exclamation-triangle"></i>
          <p>Error loading court details. Please try again later.</p>
        </div>
      </div>
    `;

    // Add event listener to close button
    document.getElementById("close-sidebar").addEventListener("click", function() {
      sidebar.classList.remove("active");
      adjustMapLayout();
    });

    // Remove loading state
    sidebar.classList.remove("loading");
  }
}
