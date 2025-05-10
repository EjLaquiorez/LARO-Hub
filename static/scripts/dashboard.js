document.addEventListener("DOMContentLoaded", () => {
    // Prevent scrolling on the dashboard
    document.body.style.overflow = 'hidden';

    // Ensure body remains unscrollable on resize
    window.addEventListener('resize', () => {
        document.body.style.overflow = 'hidden';
    });
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

    // Sample data
    const schedules = [
        { date: "2025-05-05", time: "3:00 PM", location: "Court A" },
        { date: "2025-05-10", time: "5:00 PM", location: "Court B" },
        { date: "2025-05-15", time: "6:30 PM", location: "Court C" },
    ];

    const courts = [
        { name: "Court A", distance: "1.2 km" },
        { name: "Court B", distance: "2.5 km" },
        { name: "Court C", distance: "3.8 km" },
    ];

    // Populate Upcoming Game list
    const scheduleList = upcomingPopup.querySelector(".schedule-list");
    scheduleList.innerHTML = schedules
        .map(schedule => `<li><strong>${schedule.date}</strong> - ${schedule.time} at ${schedule.location}</li>`)
        .join("");

    // Populate Nearby Courts list
    const courtsList = nearbyPopup.querySelector(".courts-list");
    courtsList.innerHTML = courts
        .map(court => `<li><strong>${court.name}</strong> - ${court.distance} away</li>`)
        .join("");

    // Helper functions
    const showPopup = (popup) => {
        popup.style.display = "flex";
        document.body.style.overflow = "hidden";
    };

    const closePopup = (popup) => {
        popup.style.display = "none";
        document.body.style.overflow = "hidden"; // Keep body unscrollable
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
    quickJoinBtn.addEventListener("click", () => showPopup(quickJoinOverlay));
    closeQuickJoinBtn.addEventListener("click", () => closePopup(quickJoinOverlay));
    window.addEventListener("click", (e) => {
        if (e.target === quickJoinOverlay) closePopup(quickJoinOverlay);
    });

    // Navigation Redirect Buttons
    document.querySelector(".btn.invite").addEventListener("click", () => {
        window.location.href = "invite.html";
    });

    document.querySelector(".btn.change-sport").addEventListener("click", () => {
        window.location.href = "change-sport.html";
    });

    // Highlight Active Nav Link
    const navLinks = document.querySelectorAll(".nav-links a");
    const currentPage = window.location.pathname.split("/").pop();
    navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === currentPage);
    });
});
