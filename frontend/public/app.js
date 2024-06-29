document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const nav = document.getElementById("nav");
  let logoutButton; // Declare logoutButton variable

  // Access token from localStorage
  let accessToken = localStorage.getItem("accessToken") || "";

  // Initial rendering of navbar
  renderNavbar();

  // Function to render navbar
  function renderNavbar() {
    if (nav) {
      if (isLoggedIn()) {
        nav.innerHTML = `
          <p>Welcome User</p>
          <button id="logout">Logout</button>`;
        logoutButton = document.getElementById("logout");
        logoutButton.addEventListener("click", logout);
      } else {
        nav.innerHTML = `
          <p>Welcome Guest</p>
          <a href="login.html">Login</a>`; // Provide a login link for guests
      }
    }
  }

  // Function to check if user is logged in
  function isLoggedIn() {
    return !!accessToken;
  }

  // Function to login
  async function login(event) {
    event.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message); // Display error message from server
        return;
      }

      // If login is successful
      const data = await response.json();
      accessToken = data.accessToken;

      // Save access token to local storage
      localStorage.setItem("accessToken", accessToken);

      // Update navbar after login
      renderNavbar();

      // Redirect to index.html or update UI
      alert("Login successful");
      window.location.href = "index.html";
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred. Please try again.");
    }
  }

  // Logout function
  function logout() {
    localStorage.removeItem("accessToken");
    accessToken = "";
    renderNavbar(); // Update navbar after logout
  }

  // Event listeners
  if (loginForm) {
    loginForm.addEventListener("submit", login);
  }

  // Event listener for signup form
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      // Handle signup logic as before
    });
  }

  // Check access token and restrict access to restricted pages
  const restrictedPages = ["dashboard.html", "forms.html", "reports.html", "admin.html"];

  if (restrictedPages.some(page => window.location.href.includes(page))) {
    if (!isLoggedIn()) {
      alert("You need to be logged in to access this page.");
      window.location.href = "login.html"; // Redirect to login page if not logged in
    }
  }

});




