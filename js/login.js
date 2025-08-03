document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  if (!loginForm) {
    console.error("Login form not found!");
    return;
  }

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
      alert("Please fill in all fields.");
      return;
    }

    // Get stored users from localStorage
    let users = [];
    try {
      const storedUsers = localStorage.getItem("users");
      users = Array.isArray(JSON.parse(storedUsers)) ? JSON.parse(storedUsers) : [];
    } catch (err) {
      users = [];
    }

    // Check if user exists with matching credentials
    const matchedUser = users.find(
      (u) => u.username === username && u.password === password
    );

    if (matchedUser) {
      // Save login session
      localStorage.setItem("loggedInUser", JSON.stringify(matchedUser));
      alert("Login successful!");
      window.location.href = "dashboard.html"; // or any page you redirect to
    } else {
      alert("Invalid username or password.");
    }
  });
});
