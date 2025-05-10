let currentUserId = null;

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
        currentUserId = user.id;

        
        let birthdate = null;
        let age = 'N/A';

        if (user.birth_date) {
            birthdate = new Date(user.birth_date);
            if (!isNaN(birthdate)) {
                age = calculateAge(birthdate);
            }
        }

        
        const formattedBirthdate = birthdate ? `${birthdate.getFullYear()}-${String(birthdate.getMonth() + 1).padStart(2, '0')}-${String(birthdate.getDate()).padStart(2, '0')}` : '';

        
        document.getElementById('full-name').textContent = `${user.firstname} ${user.lastname}`;
        document.getElementById('username').textContent = `@${user.username}`;
        document.getElementById('profile-icon').src = `../../laro_hub/BACKEND/LARO${user.profile_picture}` || "../static/img/default.jpg";
        document.querySelector('.bio-row p').textContent = user.bio || "No bio available.";
        document.querySelector('.stat-row ul').innerHTML = `
            <li>AGE - ${age}</li>
            <li>HEIGHT - ${user.height || 'N/A'}</li>
            <li>WEIGHT - ${user.weight || 'N/A'}</li>
            <li>GENDER - ${user.gender || 'N/A'}</li>
        `;

        
        document.getElementById('edit-profile-icon').src = `../../laro_hub/BACKEND/LARO${user.profile_picture}` || "../static/img/default.jpg";
        document.getElementById('first-name').value = user.firstname || '';
        document.getElementById('middle-name').value = user.middlename || '';
        document.getElementById('last-name').value = user.lastname || '';
        document.getElementById('new-username').value = user.username || '';
        document.getElementById('bio').value = user.bio || '';
        document.getElementById('birthdate').value = formattedBirthdate;
        document.getElementById('height').value = user.height || '';
        document.getElementById('weight').value = user.weight || '';
        document.getElementById('gender').value = user.gender || 'Male';

        
        document.getElementById('edit-fullname').textContent = `${user.firstname} ${user.lastname}`;
        document.getElementById('edit-username').textContent = `@${user.username}`;
    })
    .catch(err => {
        console.error(err);
        window.location.href = "login.html";
    });
});

function calculateAge(birthdate) {
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDifference = today.getMonth() - birthdate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthdate.getDate())) {
        age--;
    }
    return age;
}


document.querySelector('.edit-btn').addEventListener('click', () => {
    document.getElementById('editModal').style.display = 'block';
});


document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('editModal').style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target == document.getElementById('editModal')) {
        document.getElementById('editModal').style.display = 'none';
    }
});


document.getElementById('editProfileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access");

    const updatedData = new FormData();
    updatedData.append('firstname', document.getElementById('first-name').value.trim());
    updatedData.append('middlename', document.getElementById('middle-name').value.trim() || '');
    updatedData.append('lastname', document.getElementById('last-name').value.trim());
    updatedData.append('username', document.getElementById('new-username').value.trim());
    updatedData.append('bio', document.getElementById('bio').value.trim());
    updatedData.append('birth_date', document.getElementById('birthdate').value || '');
    updatedData.append('height', document.getElementById('height').value || '');
    updatedData.append('weight', document.getElementById('weight').value || '');
    updatedData.append('gender', document.getElementById('gender').value || '');

    const profilePictureInput = document.getElementById('photo-upload');
    if (profilePictureInput.files[0]) {
        updatedData.append('profile_picture', profilePictureInput.files[0]);
    }

    fetch(`http://localhost:8000/users/${currentUserId}/`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`
            
        },
        body: updatedData
    })
    .then(async response => {
        const data = await response.json();
        if (!response.ok) {
            console.error("Server responded with:", data);
            throw new Error("Failed to update profile.");
        }
        return data;
    })
    .then(updatedUser => {
        alert("Profile updated successfully.");
        document.getElementById('editModal').style.display = 'none';
        location.reload();
    })
    .catch(err => {
        console.error("Update error:", err);
        alert("An error occurred while updating your profile.");
    });
});


document.getElementById('change-photo-btn').addEventListener('click', function () {
    document.getElementById('photo-upload').click();
});


document.getElementById('photo-upload').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            document.getElementById('profile-icon').src = event.target.result;
            document.getElementById('edit-profile-icon').src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});
