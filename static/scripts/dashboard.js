document.addEventListener("DOMContentLoaded", () => {
    // Button and popup elements
    const upcomingGameBtn = document.querySelector(".btn.upcoming-game");
    const upcomingPopup = document.getElementById("upcoming-game-popup");
    const closeUpcomingPopupBtn = document.getElementById("close-popup");

    const nearbyCourtsBtn = document.querySelector(".btn.nearby-courts");
    const nearbyPopup = document.getElementById("nearby-courts-popup");
    const closeNearbyPopupBtn = document.getElementById("close-nearby-popup");

    // Sample data for upcoming schedules
    const schedules = [
        { date: "2025-05-05", time: "3:00 PM", location: "Court A" },
        { date: "2025-05-10", time: "5:00 PM", location: "Court B" },
        { date: "2025-05-15", time: "6:30 PM", location: "Court C" },
    ];

    // Sample data for nearby courts
    const courts = [
        { name: "Court A", distance: "1.2 km" },
        { name: "Court B", distance: "2.5 km" },
        { name: "Court C", distance: "3.8 km" },
    ];

    // Populate the upcoming games popup
    const scheduleList = upcomingPopup.querySelector(".schedule-list");
    scheduleList.innerHTML = schedules
        .map(
            (schedule) =>
                `<li><strong>${schedule.date}</strong> - ${schedule.time} at ${schedule.location}</li>`
        )
        .join("");

    // Populate the nearby courts popup
    const courtsList = nearbyPopup.querySelector(".courts-list");
    courtsList.innerHTML = courts
        .map(
            (court) =>
                `<li><strong>${court.name}</strong> - ${court.distance} away</li>`
        )
        .join("");

    // Show and close popups
    const showPopup = (popup) => {
        popup.style.display = "flex";
    };

    const closePopup = (popup) => {
        popup.style.display = "none";
    };

    // Event listeners for upcoming games popup
    upcomingGameBtn.addEventListener("click", () => showPopup(upcomingPopup));
    closeUpcomingPopupBtn.addEventListener("click", () => closePopup(upcomingPopup));
    window.addEventListener("click", (event) => {
        if (event.target === upcomingPopup) closePopup(upcomingPopup);
    });

    // Event listeners for nearby courts popup
    nearbyCourtsBtn.addEventListener("click", () => showPopup(nearbyPopup));
    closeNearbyPopupBtn.addEventListener("click", () => closePopup(nearbyPopup));
    window.addEventListener("click", (event) => {
        if (event.target === nearbyPopup) closePopup(nearbyPopup);
    });

    // Navigation buttons
    document.querySelector(".btn.quick-join").addEventListener("click", () => {
        window.location.href = "quick-join.html";
    });

    document.querySelector(".btn.invite").addEventListener("click", () => {
        window.location.href = "invite.html";
    });

    document.querySelector(".btn.change-sport").addEventListener("click", () => {
        window.location.href = "change-sport.html";
    });

    // Highlight current page in navigation
    const navLinks = document.querySelectorAll(".nav-links a");
    const currentPage = window.location.pathname.split("/").pop();

    navLinks.forEach((link) => {
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
});
