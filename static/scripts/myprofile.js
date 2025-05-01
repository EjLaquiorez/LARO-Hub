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
        
        const containerUser = document.querySelector(".containerUser");

        console.log(user)

        containerUser.innerHTML = `
            <img src="${user.image_url || '../static/img/default.jpg'}" alt="User Image">
            <div class="userDetails">
                <h4>${user.firstname} ${user.lastname}</h4>
                <p>"${user.quote || 'No quote available'}"</p>
            </div>
            <div class="editprofile">
                <div class="iconFollow">
                    <span>EDIT PROFILE </span><i class="fa-solid fa-user"></i>
                </div>
            </div>
        `;
    })
    .catch(err => {
        console.error(err);
        window.location.href = "login.html"; 
    });
});
