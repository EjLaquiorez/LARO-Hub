function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c =>
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }
  
  function isTokenValid(token) {
    const payload = parseJwt(token);
    if (!payload) return false;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  }
  
  function getLoggedInUser() {
    const user = localStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  }
  
  
  function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refresh");  
  
    if (!refreshToken) {
        window.location.href = "/login/";  // Absolute path
        return;
    }
  
    fetch("/api/token/refresh/", {  
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken })
    })
    .then(response => response.json())
    .then(data => {
        if (data.access) {
            localStorage.setItem("access", data.access);  
        } else {
            window.location.href = "/login/";  // Absolute path
        }
    })
    .catch(error => {
        console.error('Error refreshing token:', error);
        window.location.href = "/login/";  // Changed from "login.html" to "/login/"
    });
  }
  
  
  function requireAuth() {
    const token = localStorage.getItem("access");
  
    if (!token) {
      window.location.href = "/login/";  
      return;
    }
  
    if (isTokenValid(token)) {
      return;
    }
  
    
    refreshAccessToken();
  }
  
  requireAuth();
