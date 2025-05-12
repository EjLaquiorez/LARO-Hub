document.addEventListener("DOMContentLoaded", async () => {
    let currentUser = null;

    try {
        console.log("Profile page loaded, checking authentication...");

        // Get the access token
        const token = localStorage.getItem("access");
        if (!token) {
            console.error("No access token found in localStorage");
            // Redirect to login page
            window.location.href = "/login.html";
            return;
        }

        // Check if token is valid
        if (!isTokenValid(token)) {
            console.log("Token expired, attempting to refresh...");
            try {
                await refreshAccessToken();
            } catch (error) {
                console.error("Token refresh failed:", error);
                // Redirect to login page
                window.location.href = "/login.html";
                return;
            }
        }

        console.log("Access token found, fetching user data...");

        // Fetch user data
        fetch("/api/current-user/", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            console.log("Response status:", response.status);
            if (!response.ok) {
                console.error("Response not OK:", response.status);
                throw new Error("Authentication failed.");
            }
            return response.json();
        })
        .then(user => {
            console.log("User data received:", user);
            currentUser = user;
            document.getElementById("full-name").textContent = `${user.firstname} ${user.lastname}`;
            document.getElementById("username").textContent = `@${user.username || 'username'}`;
            document.getElementById("profile-icon").src = user.image_url || "/static/img/default.jpg";

            // Set up profile link for sharing
            const profileUrl = `${window.location.origin}/profile.html?id=${user.id}`;
            document.getElementById("profile-link").value = profileUrl;

            // Generate QR code
            generateQRCode(profileUrl);
        })
        .catch(err => {
            console.error("Error fetching user data:", err);
            // Redirect to login page if authentication failed
            if (err.message === "Authentication failed.") {
                window.location.href = "/login.html";
            } else {
                // For other errors, show an error message
                document.getElementById("full-name").textContent = "Error loading profile";
            }
        });
    } catch (error) {
        console.error("Profile initialization error:", error);
        // Redirect to login for authentication errors
        if (error.message && error.message.includes("authentication")) {
            window.location.href = "/login.html";
        } else {
            // For other errors, show an error message
            document.getElementById("full-name").textContent = "Error loading profile";
        }
    }

    // Settings dropdown functionality
    const settingsIcon = document.getElementById("settings-icon");
    const editProfileBtn = document.getElementById("edit-profile");
    const changePasswordBtn = document.getElementById("change-password");
    const privacySettingsBtn = document.getElementById("privacy-settings");

    // Edit Profile button in dropdown
    editProfileBtn.addEventListener("click", () => {
        openEditProfileModal();
    });

    // Change Password button
    changePasswordBtn.addEventListener("click", () => {
        alert("Change Password functionality will be implemented soon!");
    });

    // Privacy Settings button
    privacySettingsBtn.addEventListener("click", () => {
        alert("Privacy Settings functionality will be implemented soon!");
    });

    // Share Profile button
    const shareBtn = document.getElementById("share-btn");
    const shareModal = document.getElementById("share-modal");

    shareBtn.addEventListener("click", () => {
        shareModal.style.display = "flex";
    });

    // Copy profile link button
    const copyLinkBtn = document.getElementById("copy-link-btn");

    copyLinkBtn.addEventListener("click", () => {
        const profileLink = document.getElementById("profile-link");
        profileLink.select();
        document.execCommand("copy");

        // Show copied feedback
        const originalIcon = copyLinkBtn.innerHTML;
        copyLinkBtn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            copyLinkBtn.innerHTML = originalIcon;
        }, 2000);
    });

    // Social share buttons
    const facebookBtn = document.querySelector(".social-btn.facebook");
    const twitterBtn = document.querySelector(".social-btn.twitter");
    const whatsappBtn = document.querySelector(".social-btn.whatsapp");
    const emailBtn = document.querySelector(".social-btn.email");

    facebookBtn.addEventListener("click", () => {
        const url = encodeURIComponent(document.getElementById("profile-link").value);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    });

    twitterBtn.addEventListener("click", () => {
        const url = encodeURIComponent(document.getElementById("profile-link").value);
        const text = encodeURIComponent("Check out my LARO basketball profile!");
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
    });

    whatsappBtn.addEventListener("click", () => {
        const url = encodeURIComponent(document.getElementById("profile-link").value);
        window.open(`https://wa.me/?text=${url}`, '_blank');
    });

    emailBtn.addEventListener("click", () => {
        const url = document.getElementById("profile-link").value;
        window.location.href = `mailto:?subject=Check out my LARO basketball profile&body=Here's my profile: ${url}`;
    });

    // Close modals
    const closeButtons = document.querySelectorAll(".close-modal");
    const modals = document.querySelectorAll(".modal");

    closeButtons.forEach(button => {
        button.addEventListener("click", () => {
            modals.forEach(modal => {
                modal.style.display = "none";
            });
        });
    });

    // Close modal when clicking outside
    window.addEventListener("click", (event) => {
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    });

    // Edit Profile Modal
    function openEditProfileModal() {
        const editProfileModal = document.getElementById("edit-profile-modal");

        if (currentUser) {
            // Populate form with current user data
            document.getElementById("edit-fullname").value = `${currentUser.firstname} ${currentUser.lastname}`;
            document.getElementById("edit-username").value = currentUser.username || "";
            document.getElementById("edit-bio").value = "Basketball is my game."; // This would come from user data
            document.getElementById("edit-age").value = "21"; // This would come from user data
            document.getElementById("edit-height").value = "5'11\""; // This would come from user data
            document.getElementById("edit-weight").value = "90 kg"; // This would come from user data
            document.getElementById("edit-gender").value = "MALE"; // This would come from user data
        }

        editProfileModal.style.display = "flex";
    }

    // Handle Edit Profile Form Submission
    const editProfileForm = document.getElementById("edit-profile-form");

    editProfileForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(editProfileForm);
        const userData = {
            fullname: formData.get("fullname"),
            username: formData.get("username"),
            bio: formData.get("bio"),
            age: formData.get("age"),
            height: formData.get("height"),
            weight: formData.get("weight"),
            gender: formData.get("gender")
        };

        // For demo purposes, just update the UI
        document.getElementById("full-name").textContent = userData.fullname;
        document.getElementById("username").textContent = `@${userData.username}`;

        // In a real app, you would send this data to the server
        console.log("Profile updated with:", userData);

        // Close the modal
        document.getElementById("edit-profile-modal").style.display = "none";

        // Show success message
        alert("Profile updated successfully!");
    });
});

// Function to generate QR code
function generateQRCode(url) {
    const qrcodeContainer = document.getElementById("qrcode");
    qrcodeContainer.innerHTML = ""; // Clear previous QR code

    new QRCode(qrcodeContainer, {
        text: url,
        width: 180,
        height: 180,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}
