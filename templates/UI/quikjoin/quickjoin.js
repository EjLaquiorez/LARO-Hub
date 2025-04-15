const barangayLocations = {
    "tiniguiban": [9.7722, 118.7460],
    "san pedro": [9.7583, 118.7606],
    "sicsican": [9.7999, 118.7169],
  };
  
  const map = L.map('map').setView([9.7870, 118.7400], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  
  function searchBarangay() {
    const input = document.getElementById("search-barangay").value.toLowerCase();
    const location = barangayLocations[input];
  
    if (location) {
      map.setView(location, 15);
      L.marker(location).addTo(map)
        .bindPopup(`<strong>${input.toUpperCase()}</strong>`)
        .openPopup();
    } else {
      alert("Barangay not found.");
    }
  }
  