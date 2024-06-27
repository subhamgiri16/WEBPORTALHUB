document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const nav = document.getElementById("nav");
  const logoutButton = document.getElementById("logout");
  const carouselImages = document.querySelectorAll(".carousel img");

  // Access token from localStorage
  let accessToken = localStorage.getItem("accessToken") || "";
  
  // Initial rendering of navbar
  renderNavbar();

  // Function to render navbar (example)
  function renderNavbar() {
    if (nav) {
      // Modify navbar elements based on login state
      if (isLoggedIn()) {
        nav.innerHTML = `<p>Welcome User</p><button id="logout">Logout</button>`;
        logoutButton = document.getElementById("logout");
        logoutButton.addEventListener("click", logout);
      } else {
        nav.innerHTML = `<p>Welcome Guest</p>`;
      }
    }
  }

  // Function to fetch data from API
  async function fetchData() {
    try {
      const response = await fetch("http://localhost:5000/data", {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      const dataList = document.getElementById("data-list");
      dataList.innerHTML = "";
      data.forEach((item) => {
        const div = document.createElement("div");
        div.innerHTML = `
          <h3>${item.title}</h3>
          <p>${item.content}</p>
          <button onclick="editData(${item.id})">Edit</button>
        `;
        dataList.appendChild(div);
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
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

      // Fetch data after successful login
      fetchData();

      // Redirect to index.html or update UI
      alert("Login successful");
      window.location.href = "index.html";
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred. Please try again.");
    }
  }

  // Function to edit data
  async function editData(id) {
    const newTitle = prompt("Enter new title:");
    const newContent = prompt("Enter new content:");

    try {
      const response = await fetch(`http://localhost:5000/data/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
        body: JSON.stringify({ title: newTitle, content: newContent }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      fetchData(); // Refresh data after editing
    } catch (error) {
      console.error("Error editing data:", error);
    }
  }

  // Function to check if user is logged in
  function isLoggedIn() {
    return !!accessToken;
  }

  // Logout function
  function logout() {
    localStorage.removeItem("accessToken");
    accessToken = "";
    renderNavbar(); // Update navbar after logout
    // Additional logout cleanup if needed
  }

  // Fetch data if accessToken exists
  if (accessToken) {
    fetchData(); // Initial fetch of data when accessToken is present
  }

  // Expose editData to the global scope for the button onclick
  window.editData = editData;

  // Add event listener to the login form
  if (loginForm) {
    loginForm.addEventListener("submit", login);
  }

  // Event listener for signup form 
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = e.target.username.value;
      const email = e.target.email.value;
      const phone = e.target.phone.value;
      const password = e.target.password.value;
      const dt = e.target.dt.value;
      const role = e.target.role.value;

      try {
        const response = await fetch("http://localhost:5000/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, phone, password, dt, role }),
        });

        const responseBody = await response.text();
        if (!responseBody) {
          throw new Error("Response body is empty");
        }

        const data = JSON.parse(responseBody);

        if (!response.ok) {
          alert(data.message); // Display error message from server
          return;
        }

        alert("User registered successfully");
        window.location.href = "login.html"; // Redirect to login page after successful signup
      } catch (error) {
        console.error("Signup error:", error);
        alert("An error occurred during signup. Please try again later.");
      }
    });
  }

  // Carousel functionality (example)
  if (carouselImages.length > 0) {
    setInterval(() => {
      carouselImages[currentIndex].classList.remove("active");
      currentIndex = (currentIndex + 1) % carouselImages.length;
      carouselImages[currentIndex].classList.add("active");
    }, 3000);
  }


  // // Fetch data if accessToken exists
  // if (accessToken) {
  //   fetchData(); // Initial fetch of data when accessToken is present
  // }

  // Expose editData to the global scope for the button onclick
  window.editData = editData;

  // Add event listener to the login form
  if (loginForm) {
    loginForm.addEventListener("submit", login);
  }
});
