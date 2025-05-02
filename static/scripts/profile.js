document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("access");

    fetch("http://localhost:8000/current-user/", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) throw new Error("Authentication failed.");
        return response.json();
    })
    .then(user => {
        
        document.getElementById("full-name").textContent = `${user.firstname} ${user.lastname}`;
        document.getElementById("username").textContent = `@${user.username}`;
        document.getElementById("profile-icon").src = user.image_url || "../static/img/default.jpg";
    })
    .catch(err => {
        console.error(err);
        window.location.href = "login.html"; 
    });
});
