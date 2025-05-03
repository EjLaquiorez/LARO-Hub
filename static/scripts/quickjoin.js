const barangayLocations = {
  "tiniguiban": {
    coords: [9.7722, 118.7460],
    name: "Palumco Court",
    barangay: "Tiniguiban",
    image: "../static/img/open.jpg"
  },
  "san pedro": {
    coords: [9.7583, 118.7606],
    name: "San Pedro Covered Court",
    barangay: "San Pedro",
    image: "../static/img/open.jpg"
  },
  "sicsican": {
    coords: [9.7999, 118.7169],
    name: "Sicsican Basketball Court",
    barangay: "Sicsican",
    image: "../static/img/open.jpg"
  }
};

document.addEventListener("DOMContentLoaded", function() {
  const map = L.map('map').setView([9.7870, 118.7400], 13);

  // Add the tile layer for the map
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Add markers for each barangay location
  for (const key in barangayLocations) {
    const court = barangayLocations[key];
    const marker = L.marker(court.coords, {
      icon: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    }).addTo(map)
    .on("click", () => {
      showCourtInfo(court);
    });
  }
});

function showCourtInfo(court) {
  document.getElementById("court-name").innerText = court.name;
  document.getElementById("court-image").src = court.image;
  document.getElementById("barangay-name").innerText = court.barangay;
  document.getElementById("court-info-tab").classList.remove("collapsed");
}

function toggleCourtInfo() {
  const courtInfoTab = document.getElementById("court-info-tab");
  courtInfoTab.classList.toggle("collapsed");
}
