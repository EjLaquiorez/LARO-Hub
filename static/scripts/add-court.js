/**
 * Add Court Functionality for LARO-Hub
 * Handles the add court modal and form submission
 */

import authService from './auth-service.js';
import courtService from './court-service.js';

// Map variables
let addCourtMap = null;
let courtMarker = null;
const defaultLocation = [9.7870, 118.7400]; // Default location (Puerto Princesa)

document.addEventListener("DOMContentLoaded", function() {
    // Get DOM elements
    const addCourtBtn = document.getElementById('add-court-btn');
    const addCourtModal = document.getElementById('add-court-modal');
    const closeAddCourtModal = document.getElementById('close-add-court-modal');
    const cancelAddCourt = document.getElementById('cancel-add-court');
    const submitAddCourt = document.getElementById('submit-add-court');
    const addCourtForm = document.getElementById('add-court-form');

    // Check if user is authenticated
    const isAuthenticated = authService.isAuthenticated();

    // Show/hide add court button based on authentication
    if (addCourtBtn) {
        if (!isAuthenticated) {
            addCourtBtn.style.display = 'none';
        } else {
            addCourtBtn.addEventListener('click', openAddCourtModal);
        }
    }

    // Add event listeners
    if (closeAddCourtModal) {
        closeAddCourtModal.addEventListener('click', closeModal);
    }

    if (cancelAddCourt) {
        cancelAddCourt.addEventListener('click', closeModal);
    }

    if (submitAddCourt) {
        submitAddCourt.addEventListener('click', handleSubmit);
    }

    // Initialize map when modal is opened
    function openAddCourtModal() {
        // Show the modal
        if (addCourtModal) {
            addCourtModal.style.display = 'flex';

            // Initialize map after modal is visible
            setTimeout(() => {
                initializeAddCourtMap();
            }, 100);
        }
    }

    // Close the modal
    function closeModal() {
        if (addCourtModal) {
            addCourtModal.style.display = 'none';

            // Reset form
            if (addCourtForm) {
                addCourtForm.reset();
            }

            // Reset map marker
            if (courtMarker && addCourtMap) {
                courtMarker.remove();
                courtMarker = null;

                // Reset hidden inputs
                document.getElementById('court-latitude').value = '';
                document.getElementById('court-longitude').value = '';
            }
        }
    }

    // Initialize the map for adding court location
    function initializeAddCourtMap() {
        const mapContainer = document.getElementById('court-location-map');

        if (!mapContainer) return;

        // If map already initialized, just reset the view
        if (addCourtMap) {
            addCourtMap.setView(defaultLocation, 13);
            return;
        }

        // Initialize the map
        addCourtMap = L.map('court-location-map').setView(defaultLocation, 13);

        // Add tile layer (map style)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(addCourtMap);

        // Try to get user's current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const userLocation = [position.coords.latitude, position.coords.longitude];
                addCourtMap.setView(userLocation, 15);
            }, error => {
                console.warn('Error getting location:', error);
            });
        }

        // Add click event to map to set marker
        addCourtMap.on('click', function(e) {
            setCourtLocation(e.latlng.lat, e.latlng.lng);
        });

        // Set up location search
        setupLocationSearch();
    }

    // Set up location search functionality
    function setupLocationSearch() {
        const searchInput = document.getElementById('map-search-input');
        const searchButton = document.getElementById('map-search-btn');

        if (!searchInput || !searchButton) return;

        // Search when button is clicked
        searchButton.addEventListener('click', () => {
            searchLocation(searchInput.value);
        });

        // Search when Enter key is pressed
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchLocation(searchInput.value);
            }
        });
    }

    // Search for a location using Nominatim
    async function searchLocation(query) {
        if (!query.trim()) return;

        const searchInput = document.getElementById('map-search-input');
        const searchButton = document.getElementById('map-search-btn');

        // Show loading state
        searchInput.disabled = true;
        searchButton.disabled = true;
        searchButton.innerHTML = '<i class="bi bi-hourglass-split"></i>';

        try {
            // Use Nominatim for geocoding (OpenStreetMap's service)
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);

            if (!response.ok) {
                throw new Error('Failed to search location');
            }

            const data = await response.json();

            if (data && data.length > 0) {
                const result = data[0];
                const lat = parseFloat(result.lat);
                const lng = parseFloat(result.lon);

                // Set the map view to the found location
                addCourtMap.setView([lat, lng], 16);

                // Set the court location
                setCourtLocation(lat, lng);
            } else {
                alert('No locations found for your search. Please try a different query.');
            }
        } catch (error) {
            console.error('Error searching location:', error);
            alert('Error searching for location. Please try again.');
        } finally {
            // Remove loading state
            searchInput.disabled = false;
            searchButton.disabled = false;
            searchButton.innerHTML = '<i class="bi bi-search"></i>';
        }
    }

    // Set court location on map and get address
    async function setCourtLocation(lat, lng) {
        // Update hidden inputs
        document.getElementById('court-latitude').value = lat;
        document.getElementById('court-longitude').value = lng;

        // Remove existing marker if any
        if (courtMarker) {
            courtMarker.remove();
        }

        // Add new marker
        courtMarker = L.marker([lat, lng], {
            draggable: true,
            title: "Court Location",
            zIndexOffset: 1000 // Ensure marker is above other elements
        }).addTo(addCourtMap);

        // Update coordinates when marker is dragged
        courtMarker.on('dragend', function(event) {
            const marker = event.target;
            const position = marker.getLatLng();
            document.getElementById('court-latitude').value = position.lat;
            document.getElementById('court-longitude').value = position.lng;

            // Get address for the new position
            getAddressFromCoordinates(position.lat, position.lng);
        });

        // Get address for the initial position
        await getAddressFromCoordinates(lat, lng);
    }

    // Get address from coordinates using reverse geocoding
    async function getAddressFromCoordinates(lat, lng) {
        const locationInput = document.getElementById('court-location-input');

        // Show loading state
        locationInput.value = 'Getting location...';
        locationInput.disabled = true;

        try {
            // Use Nominatim for reverse geocoding (OpenStreetMap's service)
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);

            if (!response.ok) {
                throw new Error('Failed to get address');
            }

            const data = await response.json();

            // Format the address
            let address = '';

            if (data.address) {
                // Try to get the most relevant parts of the address
                const parts = [];

                // Add neighborhood or suburb if available
                if (data.address.neighbourhood) {
                    parts.push(data.address.neighbourhood);
                } else if (data.address.suburb) {
                    parts.push(data.address.suburb);
                }

                // Add city/town/village
                if (data.address.city) {
                    parts.push(data.address.city);
                } else if (data.address.town) {
                    parts.push(data.address.town);
                } else if (data.address.village) {
                    parts.push(data.address.village);
                }

                // Add state/province
                if (data.address.state) {
                    parts.push(data.address.state);
                }

                // Add country
                if (data.address.country) {
                    parts.push(data.address.country);
                }

                address = parts.join(', ');
            }

            // If we couldn't parse a good address, use the display_name
            if (!address && data.display_name) {
                address = data.display_name;
            }

            // Update the location input
            locationInput.value = address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        } catch (error) {
            console.error('Error getting address:', error);
            // If there's an error, just use the coordinates
            locationInput.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        } finally {
            // Remove loading state
            locationInput.disabled = false;
        }
    }

    // Handle form submission
    async function handleSubmit(e) {
        e.preventDefault();

        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
            alert('You must be logged in to add a court.');
            return;
        }

        // Get form values
        const name = document.getElementById('court-name-input').value;
        const location = document.getElementById('court-location-input').value;
        const rentalFee = document.getElementById('court-rental-fee').value;
        const availability = document.getElementById('court-availability').value;
        const latitude = document.getElementById('court-latitude').value;
        const longitude = document.getElementById('court-longitude').value;

        // Get selected features
        const featureCheckboxes = document.querySelectorAll('input[name="features"]:checked');
        const features = Array.from(featureCheckboxes).map(cb => cb.value);

        // Validate required fields
        if (!name || !location) {
            alert('Please fill in all required fields.');
            return;
        }

        if (!latitude || !longitude) {
            alert('Please select a location on the map.');
            return;
        }

        // Prepare court data
        const courtData = {
            name: name,
            location: location,
            rental_fee: rentalFee || 0,
            availability: availability || 'Open 24 Hours',
            features: features,
            coords: [parseFloat(latitude), parseFloat(longitude)]
        };

        try {
            // Show loading state
            submitAddCourt.disabled = true;
            submitAddCourt.innerHTML = '<i class="bi bi-hourglass-split"></i> Adding...';

            // Submit the court data
            const result = await courtService.createCourt(courtData);

            // Show success message
            alert('Court added successfully!');

            // Close the modal and reset form
            closeModal();

            // Refresh court list if on the quick join page
            if (typeof generateCourtCards === 'function') {
                generateCourtCards();
            }

            // Refresh map if available
            if (typeof initializeMap === 'function') {
                initializeMap();
            }
        } catch (error) {
            console.error('Error adding court:', error);
            alert('Failed to add court. Please try again.');
        } finally {
            // Reset button state
            submitAddCourt.disabled = false;
            submitAddCourt.innerHTML = '<i class="bi bi-plus-circle"></i> Add Court';
        }
    }
});
