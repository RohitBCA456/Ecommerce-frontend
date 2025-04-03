document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signup-form");
  const loginForm = document.getElementById("login-form");
  const loginButton = document.getElementById("mainLoginBtn");
  const loginModal = new bootstrap.Modal(document.getElementById("loginModal"));

  // Function to update UI based on login state
  const updateLoginState = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn) {
      loginButton.textContent = "Logout";
    } else {
      loginButton.textContent = "Login";
    }
  };

  // Signup Form Submission
  signupForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const signupFormData = new FormData(signupForm);
    const signupData = Object.fromEntries(signupFormData.entries());

    console.log("Signup Data Sent:", signupData); // Debugging

    try {
      const signupResponse = await fetch(
        "http://localhost:4000/user/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify(signupData),
        }
      );

      if (signupResponse.ok) {
        alert("Signup successful.");
        signupForm.reset();
        window.location.href = "http://127.0.0.1:5500";
      } else {
        alert("Failed to signup. Please check the form data.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    }
  });

  // Login Form Submission
  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const loginFormData = new FormData(loginForm);
    const loginData = Object.fromEntries(loginFormData.entries());

    console.log("Login Data Sent:", loginData); // Debugging

    try {
      const loginResponse = await fetch("http://localhost:4000/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify(loginData),
      });

      if (loginResponse.ok) {
        localStorage.setItem("isLoggedIn", "true");
        alert("Login successful.");
        loginForm.reset();
        loginModal.hide(); // Hide modal after successful login
        updateLoginState();
      } else {
        alert("Failed to login. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    }
  });

  // Login/Logout Button Click Event
  loginButton?.addEventListener("click", async () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn) {
      // Logout Logic
      try {
        const logoutResponse = await fetch(
          "http://localhost:4000/user/logout",
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (logoutResponse.ok) {
          localStorage.setItem("isLoggedIn", "false");
          alert("You have been logged out.");
          updateLoginState();
        } else {
          alert("Failed to log out. Please try again.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong. Please try again.");
      }
    } else {
      // Show Login Modal when not logged in
      loginModal.show();
    }
  });

  // Initial UI update
  updateLoginState();
});

async function addToCart() {
  let count = parseInt(document.querySelector(".count")?.innerText) || 0;
  const title = document.querySelector(".card-title")?.innerText;
  const text = document.querySelector(".card-text")?.innerText;
  const price = document.querySelector(".item-price")?.innerText;

  const itemData = { title, text, price };

  try {
    const cartResponse = await fetch("http://localhost:4000/user/add-to-cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify(itemData),
    });

    userId = cartResponse.Id;

    const dbResponse = await fetch(
      "http://localhost:4000/cart/add-to-database",
      {
        method: "GET",
        credentials: "include",
      }
    );
    if (dbResponse.ok) {
      count++;
      alert("Item added to cart successfully.");
      document.querySelector(".count").innerText = count;
    } else {
      alert("Failed to add item to cart.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong. Please try again.");
  }
}

async function displayCartItems() {
  let userId;
  try {
    const response = await fetch("http://localhost:4000/user/get-userId", {
      method: "GET",
      credentials: "include",
    });
    if(response.ok){
      userId = response.Id;
      console.log(userId);
    }
  } catch (error) {
    alert(error);
    console.log(error);
  }
  try {
    const response = await fetch(
      `http://localhost:4000/cart/get-cart-item/${userId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      }
    );

    if (response.ok) {
      const cartItems = await response.json();
      const cartContainer = document.querySelector(".cart-items");

      if (cartContainer) {
        cartContainer.innerHTML = ""; // Clear existing items

        cartItems.forEach((item) => {
          const itemElement = document.createElement("div");
          itemElement.className = "cart-item";
          itemElement.innerHTML = `
            <h5>${item.title}</h5>
            <p>${item.text}</p>
            <p>Price: ${item.price}</p>
          `;
          cartContainer.appendChild(itemElement);
        });
      }
    } else {
      alert("Failed to fetch cart items.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong. Please try again.");
  }
}

const cartBtn = document.getElementById("cartBtn");

function redirectUser() {
  window.location.href = "http://127.0.0.1:5500/cart.html";
}
