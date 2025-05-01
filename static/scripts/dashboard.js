document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".btn.nearby-courts").addEventListener("click", () => {
        window.location.href = "nearby-courts.html";
    });

    document.querySelector(".btn.quick-join").addEventListener("click", () => {
        window.location.href = "quick-join.html";
    });

    document.querySelector(".btn.upcoming-game").addEventListener("click", () => {
        window.location.href = "upcoming-games.html";
    });

    document.querySelector(".btn.invite").addEventListener("click", () => {
        window.location.href = "invite.html";
    });

    document.querySelector(".btn.change-sport").addEventListener("click", () => {
        window.location.href = "change-sport.html";
    });
});