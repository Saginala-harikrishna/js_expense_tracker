document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");

  if (!registerForm) {
    console.error("Register form not found!");
    return;
  }

  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!username || !email || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
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

    // Check for existing username/email
    const userExists = users.some(
      (u) => u.username === username || u.email === email
    );

    if (userExists) {
      alert("Username or email already exists.");
      return;
    }

    // Save new user
    const newUser = { username, email, password };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Registration successful!");
    window.location.href = "index.html";
  });
});
