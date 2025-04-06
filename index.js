let userId;
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

async function addToCart(button) {
  const card = button.closest(".card"); // Get the card related to the clicked button

  const title = card.querySelector(".card-title")?.innerText;
  const text = card.querySelector(".card-text")?.innerText;
  const price =
    card.querySelector(".item-price")?.innerText ||
    card.querySelector(".text-primary")?.innerText;
  const image = card.querySelector(".card-img-top")?.src;

  const itemData = { title, text, price, image };
  let count = parseInt(document.querySelector(".count")?.innerText) || 0;

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
  try {
    const response = await fetch("http://localhost:4000/user/get-userId", {
      method: "GET",
      credentials: "include",
    });
    if (response.ok) {
      userId = await response.json();
      console.log(userId);
    }
  } catch (error) {
    alert(error);
    console.log(error);
  }
  try {
    const response = await fetch(
      `http://localhost:4000/cart/get-cart-item/${userId.Id}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log(data); // Should be { cartItems: [...] }

      const cartItems = data.cartItems;
      const cartContainer = document.querySelector(".cart-items");

      if (cartContainer) {
        cartContainer.innerHTML = "";

        cartItems.forEach((item) => {
          const itemElement = document.createElement("div");
          itemElement.className = "col-md-6 col-lg-4 mb-4"; // Responsive columns
          itemElement.innerHTML = `
      <div class="card h-100 shadow rounded-4 border-0">
  <img src="${item.image}" class="card-img-top rounded-top" alt="${item.productName}" style="height: 250px; object-fit: cover;">
  <div class="card-body d-flex flex-column">
    <h5 class="card-title">${item.productName}</h5>
    <p class="card-text">${item.text}</p> <!-- ADDED: product description -->
    <p class="card-text text-primary fw-bold">${item.price}</p>
    <div class="mt-auto d-flex justify-content-between">
      <button class="btn btn-success btn-sm buy-now-btn" data-id="${item._id}">Buy Now</button>
      <button class="btn btn-danger btn-sm remove-btn" data-id="${item._id}">Remove</button>
    </div>
  </div>
</div>

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

async function cartLength() {
  try {
    const response = await fetch("http://localhost:4000/user/get-userId", {
      method: "GET",
      credentials: "include",
    });
    if (response.ok) {
      userId = await response.json();
      console.log(userId);
    }
  } catch (error) {
    alert(error);
    console.log(error);
  }
  try {
    const response = await fetch(
      `http://localhost:4000/cart/get-cart-item/${userId.Id}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      }
    );
    const cartLengthElem = document.querySelector(".count");
    if (response.ok) {
      const data = await response.json();
      const cartItems = data.cartItems || [];
      cartLengthElem.innerText = cartItems.length;
    } else {
      cartLengthElem.innerText = "0";
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong. Please try again.");
  }
}
