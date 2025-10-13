document.addEventListener("DOMContentLoaded", function () {
    const createGameBtn = document.querySelector(".btn.create-game");
    const createGamePopup = document.getElementById("create-game-popup");
    const locationCardsContainer = document.querySelector(".location-cards");
    const indicatorsContainer = document.querySelector(".carousel-indicators");
    const closeBtn = document.getElementById("close-create-game-popup");
    const prevBtn = document.getElementById("carousel-prev");
    const nextBtn = document.getElementById("carousel-next");

    let selectedCourt = null;
    let currentIndex = 0;
    const cardWidth = 270; // must match your CSS card width + gap

    // Fetch with JWT auth
    async function fetchWithAuth(url, options = {}) {
        let token = localStorage.getItem("access");
        let refresh = localStorage.getItem("refresh");

        if (!token) return null;

        let response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        // Handle token refresh
        if (response.status === 401 && refresh) {
            const refreshResponse = await fetch("/api/token/refresh/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh })
            });
            if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                localStorage.setItem("access", refreshData.access);
                token = refreshData.access;

                response = await fetch(url, {
                    ...options,
                    headers: {
                        ...options.headers,
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
            } else {
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                window.location.replace("/login/");
                return null;
            }
        }
        return response;
    }

    async function loadCourts() {
        try {
            const response = await fetchWithAuth("/api/courts/");
            if (!response || !response.ok) throw new Error("Failed to fetch courts");

            const data = await response.json();
            console.log("Courts data:", data);

            locationCardsContainer.innerHTML = "";
            indicatorsContainer.innerHTML = "";
            currentIndex = 0;

            if (!Array.isArray(data) || data.length === 0) {
                locationCardsContainer.innerHTML = `<p class="no-courts">No courts available.</p>`;
                return;
            }

            data.forEach((court, index) => {
                // Create card
                const card = document.createElement("div");
                card.classList.add("location-card");
                card.setAttribute("data-location", court.name);

                card.innerHTML = `
                    <img src="${court.image || '/static/img/default-court.jpg'}" alt="${court.name}">
                    <div class="location-info">
                        <h4>${court.name}</h4>
                        <p>${court.description || 'Basketball Court'}</p>
                        <div class="location-details">
                            <span><i class="bi bi-geo-alt"></i> ${court.distance || 'Nearby'}</span>
                            <span><i class="bi bi-star-fill"></i> ${court.rating || '4.5'}</span>
                        </div>
                    </div>
                `;

                // Card click selects
                card.addEventListener("click", () => {
                    document.querySelectorAll(".location-card").forEach(c => c.classList.remove("selected"));
                    card.classList.add("selected");
                    selectedCourt = court.id;
                    console.log("Selected court:", court.name, "ID:", court.id);
                });

                locationCardsContainer.appendChild(card);

                // Create indicator
                const indicator = document.createElement("span");
                indicator.classList.add("indicator");
                if (index === 0) indicator.classList.add("active");
                indicator.dataset.index = index;
                indicator.addEventListener("click", () => {
                    currentIndex = index;
                    locationCardsContainer.scrollTo({ left: index * cardWidth, behavior: "smooth" });
                    updateIndicators();
                });
                indicatorsContainer.appendChild(indicator);
            });
        } catch (err) {
            console.error("Error fetching courts:", err);
            locationCardsContainer.innerHTML = `<p class="error">Failed to load courts. Please try again later.</p>`;
        }
    }

    function updateIndicators() {
        indicatorsContainer.querySelectorAll(".indicator").forEach(dot => dot.classList.remove("active"));
        const activeDot = indicatorsContainer.querySelector(`[data-index="${currentIndex}"]`);
        if (activeDot) activeDot.classList.add("active");
    }

    // Carousel prev/next
    prevBtn?.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            locationCardsContainer.scrollBy({ left: -cardWidth, behavior: "smooth" });
            updateIndicators();
        }
    });

    nextBtn?.addEventListener("click", () => {
        const totalCards = locationCardsContainer.querySelectorAll(".location-card").length;
        if (currentIndex < totalCards - 1) {
            currentIndex++;
            locationCardsContainer.scrollBy({ left: cardWidth, behavior: "smooth" });
            updateIndicators();
        }
    });

    // Open modal and load courts
    createGameBtn?.addEventListener("click", () => {
        createGamePopup.style.display = "flex";
        loadCourts();
    });

    // Close modal
    closeBtn?.addEventListener("click", () => {
        createGamePopup.style.display = "none";
    });
});
