const Restaurant = require("../models/Restaurant");

// Escape special characters before using user input in MongoDB regex
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

exports.getRestaurants = async (req, res) => {
  try {
    const {
      search,
      location,
      type,
      category,
      maxPrice,
      minRating,
      sort
    } = req.query;

    const filter = {};

    // =========================
    // SEARCH
    // =========================
    if (search && search.trim() !== "") {
      const searchText = escapeRegex(search.trim());

      filter.$or = [
        {
          name: {
            $regex: searchText,
            $options: "i"
          }
        },
        {
          location: {
            $regex: searchText,
            $options: "i"
          }
        },
        {
          type: {
            $regex: searchText,
            $options: "i"
          }
        }
      ];
    }

    // =========================
    // LOCATION FILTER
    // =========================
    if (location && location.trim() !== "") {
      filter.location = {
        $regex: escapeRegex(location.trim()),
        $options: "i"
      };
    }

    // =========================
    // FOOD TYPE / CATEGORY
    // =========================
    const selectedType = type || category;

    if (
      selectedType &&
      selectedType.trim() !== "" &&
      selectedType.toLowerCase() !== "all"
    ) {
      filter.type = {
        $regex: `^${escapeRegex(selectedType.trim())}$`,
        $options: "i"
      };
    }

    // =========================
    // MAXIMUM PRICE
    // =========================
    if (maxPrice !== undefined && maxPrice !== "") {
      const price = Number(maxPrice);

      if (!Number.isNaN(price)) {
        filter.price = {
          $lte: price
        };
      }
    }

    // =========================
    // MINIMUM RATING
    // =========================
    if (minRating !== undefined && minRating !== "") {
      const rating = Number(minRating);

      if (!Number.isNaN(rating)) {
        filter.rating = {
          $gte: rating
        };
      }
    }

    // =========================
    // SORTING
    // =========================
    let sortOption = {};

    switch (sort) {
      case "ratingDesc":
        sortOption = {
          rating: -1
        };
        break;

      case "ratingAsc":
        sortOption = {
          rating: 1
        };
        break;

      case "priceAsc":
        sortOption = {
          price: 1
        };
        break;

      case "priceDesc":
        sortOption = {
          price: -1
        };
        break;

      case "nameAsc":
        sortOption = {
          name: 1
        };
        break;

      case "nameDesc":
        sortOption = {
          name: -1
        };
        break;

      default:
        sortOption = {};
    }

    // =========================
    // DATABASE QUERY
    // =========================
    const restaurants = await Restaurant
      .find(filter)
      .sort(sortOption);

    // =========================
    // RESPONSE
    // =========================
    res.status(200).json(restaurants);

  } catch (error) {
    console.error("❌ Restaurant API Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurants",
      error: error.message
    });
  }
};
const express = require("express");

const router = express.Router();

const restaurantController = require("../controllers/restaurantController");

// GET all restaurants
// GET /api/restaurants
//
// Search:
// GET /api/restaurants?search=biryani
//
// Filters:
// GET /api/restaurants?maxPrice=300
// GET /api/restaurants?minRating=4
// GET /api/restaurants?type=Biryani
//
// Sorting:
// GET /api/restaurants?sort=ratingDesc
// GET /api/restaurants?sort=priceAsc

router.get("/", restaurantController.getRestaurants);

module.exports = router;
// ======================================================
// FOODFINDER - STAGE 2
// MongoDB Search + Filters + Sorting + Categories
// ======================================================

let restaurants = [];


// ======================================================
// DOM ELEMENTS
// ======================================================

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const result = document.getElementById("result");

const filterBtn = document.getElementById("filterBtn");

const budgetFilter = document.getElementById("budgetFilter");
const ratingFilter = document.getElementById("ratingFilter");
const foodFilter = document.getElementById("foodFilter");

const sortFilter = document.getElementById("sortFilter");
const categoryFilter = document.getElementById("categoryFilter");

const trendingList = document.getElementById("trendingList");


// ======================================================
// API URL
// ======================================================

// Relative URL works on:
// http://127.0.0.1:3000
// AND
// https://foodfinder-backend-m4dg.onrender.com

const API_URL = "/api/restaurants";


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ======================================================
// FORMAT RESTAURANT DATA
// ======================================================

function formatRestaurant(r) {

    return {
        ...r,

        price: Number(r.price) || 0,

        rating: Number(r.rating) || 0,

        status: r.status || "Open",

        trending: r.trending !== false,

        type: r.type || "Other",

        phone: r.phone || "",

        website: r.website || "",

        menu: Array.isArray(r.menu)
            ? r.menu
            : [],

        image: r.image
            ? (
                r.image.startsWith("images/")
                    ? r.image
                    : "images/" + r.image
            )
            : "images/restaurant1.jpg"
    };
}


// ======================================================
// LOAD RESTAURANTS FROM MONGODB
// ======================================================

async function loadRestaurants(params = {}) {

    try {

        if (result) {
            result.innerHTML = `
                <div class="loading">
                    <h3>⏳ Loading restaurants...</h3>
                </div>
            `;
        }

        const query = new URLSearchParams();

        // Search
        if (params.search) {
            query.set("search", params.search);
        }

        // Location
        if (params.location) {
            query.set("location", params.location);
        }

        // Type
        if (params.type) {
            query.set("type", params.type);
        }

        // Category
        if (params.category) {
            query.set("category", params.category);
        }

        // Price
        if (params.maxPrice) {
            query.set("maxPrice", params.maxPrice);
        }

        // Rating
        if (params.minRating) {
            query.set("minRating", params.minRating);
        }

        // Sorting
        if (params.sort) {
            query.set("sort", params.sort);
        }

        const url = query.toString()
            ? `${API_URL}?${query.toString()}`
            : API_URL;

        console.log("🔎 API Request:", url);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                `Server returned ${response.status}`
            );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Invalid restaurant data received");
        }

        restaurants = data.map(formatRestaurant);

        displayRestaurants(restaurants);

        showTrending();

        console.log(
            "✅ Restaurants loaded from MongoDB:",
            restaurants
        );

    } catch (error) {

        console.error(
            "❌ Error loading restaurants:",
            error
        );

        if (result) {

            result.innerHTML = `
                <div class="error-message">
                    <h3>❌ Unable to load restaurants</h3>
                    <p>Please try again.</p>
                    <button onclick="loadRestaurants()">
                        🔄 Retry
                    </button>
                </div>
            `;
        }
    }
}


// ======================================================
// DISPLAY RESTAURANTS
// ======================================================

function displayRestaurants(list) {

    if (!result) {
        return;
    }

    result.innerHTML = "";

    if (!list || list.length === 0) {

        result.innerHTML = `
            <div class="no-results">
                <h3>😔 No restaurants found</h3>
                <p>Try changing your search or filters.</p>
            </div>
        `;

        return;
    }


    list.forEach((r, index) => {

        const image = escapeHTML(r.image);

        const name = escapeHTML(r.name);

        const location = escapeHTML(r.location);

        const type = escapeHTML(r.type);

        const rating = Number(r.rating).toFixed(1);

        const price = Number(r.price);


        result.innerHTML += `

        <div class="restaurant-card">

            <img
                src="${image}"
                class="restaurant-img"
                alt="${name}"
                onerror="this.src='images/restaurant1.jpg'"
            >

            <h3>${name}</h3>

            <p>
                ⭐ ${rating}
            </p>

            <p>
                📍 ${location}
            </p>

            <p>
                💰 ₹${price}
            </p>

            <p>
                🍽️ ${type}
            </p>

            <p>
                ${r.status === "Closed" ? "🔴 Closed" : "🟢 Open"}
            </p>

            <div class="restaurant-buttons">

                <button onclick="showMenu(${index})">
                    🍽️ View Menu
                </button>

                ${
                    r.phone
                        ? `
                        <button
                            onclick="callRestaurant('${escapeHTML(r.phone)}')"
                        >
                            📞 Call
                        </button>
                        `
                        : ""
                }

                ${
                    r.website
                        ? `
                        <button
                            onclick="openWebsite('${escapeHTML(r.website)}')"
                        >
                            🌐 Website
                        </button>
                        `
                        : ""
                }

                <button
                    onclick="saveFavorite('${escapeHTML(r.name)}')"
                >
                    ❤️ Favorite
                </button>

            </div>

        </div>

        `;
    });
}


// ======================================================
// SEARCH
// ======================================================

function searchRestaurants() {

    if (!searchInput) {
        return;
    }

    const searchText =
        searchInput.value.trim();


    loadRestaurants({
        search: searchText
    });
}


// Search button
if (searchBtn) {

    searchBtn.addEventListener(
        "click",
        searchRestaurants
    );
}


// Enter key
if (searchInput) {

    searchInput.addEventListener(
        "keyup",
        function(event) {

            if (event.key === "Enter") {

                searchRestaurants();

            }

        }
    );
}


// ======================================================
// STAGE 2 FILTERS
// ======================================================

function applyFilters() {

    const params = {};


    // -------------------------
    // Search
    // -------------------------

    if (searchInput) {

        const search =
            searchInput.value.trim();

        if (search) {
            params.search = search;
        }
    }


    // -------------------------
    // Budget
    // -------------------------

    if (
        budgetFilter &&
        budgetFilter.value !== ""
    ) {

        params.maxPrice =
            budgetFilter.value;
    }


    // -------------------------
    // Rating
    // -------------------------

    if (
        ratingFilter &&
        ratingFilter.value !== ""
    ) {

        params.minRating =
            ratingFilter.value;
    }


    // -------------------------
    // Food Type
    // -------------------------

    if (
        foodFilter &&
        foodFilter.value !== "" &&
        foodFilter.value.toLowerCase() !== "all"
    ) {

        params.type =
            foodFilter.value;
    }


    // -------------------------
    // Category
    // -------------------------

    if (
        categoryFilter &&
        categoryFilter.value !== "" &&
        categoryFilter.value.toLowerCase() !== "all"
    ) {

        params.category =
            categoryFilter.value;
    }


    // -------------------------
    // Sorting
    // -------------------------

    if (
        sortFilter &&
        sortFilter.value !== ""
    ) {

        params.sort =
            sortFilter.value;
    }


    console.log(
        "🔎 Applying Stage 2 filters:",
        params
    );


    loadRestaurants(params);
}


// Filter button
if (filterBtn) {

    filterBtn.addEventListener(
        "click",
        applyFilters
    );
}


// ======================================================
// SORTING
// ======================================================

if (sortFilter) {

    sortFilter.addEventListener(
        "change",
        applyFilters
    );
}


// ======================================================
// CATEGORY FILTER
// ======================================================

if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        applyFilters
    );
}


// ======================================================
// FOOD TYPE FILTER
// ======================================================

if (foodFilter) {

    foodFilter.addEventListener(
        "change",
        applyFilters
    );
}


// ======================================================
// RESET FILTERS
// ======================================================

function resetFilters() {

    if (searchInput) {
        searchInput.value = "";
    }

    if (budgetFilter) {
        budgetFilter.value = "";
    }

    if (ratingFilter) {
        ratingFilter.value = "";
    }

    if (foodFilter) {
        foodFilter.value = "";
    }

    if (categoryFilter) {
        categoryFilter.value = "";
    }

    if (sortFilter) {
        sortFilter.value = "";
    }


    loadRestaurants();
}


// Make available to HTML onclick
window.resetFilters = resetFilters;


// ======================================================
// TRENDING RESTAURANTS
// ======================================================

function showTrending() {

    if (!trendingList) {
        return;
    }

    trendingList.innerHTML = "";


    restaurants
        .filter(r => r.trending)
        .forEach(r => {

            trendingList.innerHTML += `

                <div class="trending-card">

                    <h3>
                        ${escapeHTML(r.name)}
                    </h3>

                    <p>
                        ⭐ ${Number(r.rating).toFixed(1)}
                    </p>

                    <p>
                        📍 ${escapeHTML(r.location)}
                    </p>

                    <p>
                        🍽️ ${escapeHTML(r.type)}
                    </p>

                </div>

            `;

        });
}


// ======================================================
// FAVORITES
// ======================================================

function saveFavorite(name) {

    let favorites =
        JSON.parse(
            localStorage.getItem("favorites")
        ) || [];


    if (!favorites.includes(name)) {

        favorites.push(name);

        localStorage.setItem(
            "favorites",
            JSON.stringify(favorites)
        );

        alert(
            name +
            " added to Favorites ❤️"
        );

    } else {

        alert(
            "Already in Favorites ❤️"
        );
    }
}


const showFavorites =
    document.getElementById(
        "showFavorites"
    );


if (showFavorites) {

    showFavorites.addEventListener(
        "click",
        function() {

            const favorites =
                JSON.parse(
                    localStorage.getItem(
                        "favorites"
                    )
                ) || [];


            if (favorites.length === 0) {

                alert(
                    "No Favorite Restaurants"
                );

                return;
            }


            alert(
                "Your Favorites:\n\n" +
                favorites.join("\n")
            );

        }
    );
}


// ======================================================
// CALL RESTAURANT
// ======================================================

function callRestaurant(phone) {

    if (!phone) {

        alert(
            "Phone number not available."
        );

        return;
    }

    window.location.href =
        "tel:" + phone;
}

window.callRestaurant =
    callRestaurant;


// ======================================================
// OPEN WEBSITE
// ======================================================

function openWebsite(website) {

    if (!website) {

        alert(
            "Website not available."
        );

        return;
    }


    let url = website.trim();


    if (
        !url.startsWith("http://") &&
        !url.startsWith("https://")
    ) {

        url =
            "https://" + url;
    }


    window.open(
        url,
        "_blank"
    );
}

window.openWebsite =
    openWebsite;


// ======================================================
// MENU
// ======================================================

function showMenu(index) {

    const restaurant =
        restaurants[index];


    if (!restaurant) {

        alert(
            "Restaurant not found."
        );

        return;
    }


    if (
        !restaurant.menu ||
        restaurant.menu.length === 0
    ) {

        alert(
            "🍽️ Menu information is not available yet."
        );

        return;
    }


    let menu =
        "🍽️ " +
        restaurant.name +
        "\n\n";


    restaurant.menu.forEach(
        item => {

            menu +=
                "• " +
                item +
                "\n";

        }
    );


    alert(menu);
}

window.showMenu =
    showMenu;


// ======================================================
// LOCATION
// ======================================================

const locationBtn =
    document.getElementById(
        "locationBtn"
    );

const userLocation =
    document.getElementById(
        "userLocation"
    );


if (locationBtn) {

    locationBtn.addEventListener(
        "click",
        () => {

            if (
                navigator.geolocation
            ) {

                navigator.geolocation.getCurrentPosition(
                    showPosition,
                    showLocationError
                );

            } else {

                if (userLocation) {

                    userLocation.innerHTML =
                        "❌ Geolocation is not supported.";

                }

            }

        }
    );
}


function showPosition(position) {

    const latitude =
        position.coords.latitude;

    const longitude =
        position.coords.longitude;


    if (userLocation) {

        userLocation.innerHTML =
            `
            📍 Latitude:
            ${latitude}<br>

            📍 Longitude:
            ${longitude}
            `;

    }
}


function showLocationError(error) {

    if (!userLocation) {
        return;
    }


    switch (error.code) {

        case error.PERMISSION_DENIED:

            userLocation.innerHTML =
                "❌ Location permission denied.";

            break;


        case error.POSITION_UNAVAILABLE:

            userLocation.innerHTML =
                "❌ Location unavailable.";

            break;


        case error.TIMEOUT:

            userLocation.innerHTML =
                "❌ Location request timed out.";

            break;


        default:

            userLocation.innerHTML =
                "❌ Unable to get location.";

    }
}


// ======================================================
// NEARBY RESTAURANTS
// ======================================================

const nearbyBtn =
    document.getElementById(
        "nearbyBtn"
    );


if (nearbyBtn) {

    nearbyBtn.addEventListener(
        "click",
        () => {

            if (
                navigator.geolocation
            ) {

                navigator.geolocation.getCurrentPosition(
                    openNearbyRestaurants,
                    showLocationError
                );

            } else {

                alert(
                    "Geolocation is not supported."
                );

            }

        }
    );
}


function openNearbyRestaurants(position) {

    const latitude =
        position.coords.latitude;

    const longitude =
        position.coords.longitude;


    const url =
        `https://www.google.com/maps/search/restaurants/@${latitude},${longitude},15z`;


    window.open(
        url,
        "_blank"
    );
}


// ======================================================
// LOGIN
// ======================================================

const loginBtn =
    document.getElementById(
        "loginBtn"
    );


if (loginBtn) {

    loginBtn.addEventListener(
        "click",
        () => {

            const username =
                document.getElementById(
                    "username"
                )?.value.trim();


            const password =
                document.getElementById(
                    "password"
                )?.value;


            if (
                !username ||
                !password
            ) {

                alert(
                    "Please fill all fields!"
                );

                return;
            }


            localStorage.setItem(
                "username",
                username
            );


            alert(
                "Welcome " +
                username +
                "!"
            );


            window.location.href =
                "index.html";

        }
    );
}


// ======================================================
// RESTAURANT DETAILS POPUP
// ======================================================

function showDetails(r) {

    const popup =
        document.getElementById(
            "popup"
        );


    if (!popup || !r) {
        return;
    }


    popup.style.display =
        "flex";


    const popupName =
        document.getElementById(
            "popupName"
        );

    const popupLocation =
        document.getElementById(
            "popupLocation"
        );

    const popupPrice =
        document.getElementById(
            "popupPrice"
        );

    const popupRating =
        document.getElementById(
            "popupRating"
        );

    const popupType =
        document.getElementById(
            "popupType"
        );


    if (popupName) {

        popupName.textContent =
            r.name;

    }


    if (popupLocation) {

        popupLocation.textContent =
            "📍 " + r.location;

    }


    if (popupPrice) {

        popupPrice.textContent =
            "💰 ₹" + r.price;

    }


    if (popupRating) {

        popupRating.textContent =
            "⭐ " + r.rating;

    }


    if (popupType) {

        popupType.textContent =
            "🍽️ " + r.type;

    }
}


window.showDetails =
    showDetails;


// Close popup
const closePopup =
    document.getElementById(
        "closePopup"
    );


if (closePopup) {

    closePopup.onclick =
        function() {

            const popup =
                document.getElementById(
                    "popup"
                );


            if (popup) {

                popup.style.display =
                    "none";

            }

        };
}


// ======================================================
// REVIEWS
// ======================================================

const reviewBtn =
    document.getElementById(
        "reviewBtn"
    );


if (reviewBtn) {

    reviewBtn.addEventListener(
        "click",
        () => {

            const name =
                document.getElementById(
                    "userName"
                )?.value.trim();


            const rating =
                document.getElementById(
                    "userRating"
                )?.value;


            const review =
                document.getElementById(
                    "userReview"
                )?.value.trim();


            if (!name || !review) {

                alert(
                    "Please fill all fields!"
                );

                return;
            }


            const reviews =
                JSON.parse(
                    localStorage.getItem(
                        "reviews"
                    )
                ) || [];


            reviews.push({

                name,

                rating,

                review

            });


            localStorage.setItem(
                "reviews",
                JSON.stringify(reviews)
            );


            displayReviews();


            document.getElementById(
                "userName"
            ).value = "";


            document.getElementById(
                "userReview"
            ).value = "";

        }
    );
}


// Display reviews
function displayReviews() {

    const reviewList =
        document.getElementById(
            "reviewList"
        );


    if (!reviewList) {
        return;
    }


    const reviews =
        JSON.parse(
            localStorage.getItem(
                "reviews"
            )
        ) || [];


    reviewList.innerHTML = "";


    reviews.forEach(r => {

        reviewList.innerHTML += `

            <div class="review-card">

                <h3>
                    ${escapeHTML(r.name)}
                </h3>

                <p>
                    ⭐ ${escapeHTML(r.rating)}/5
                </p>

                <p>
                    ${escapeHTML(r.review)}
                </p>

            </div>

        `;

    });
}


displayReviews();


// ======================================================
// RECOMMENDATION SYSTEM
// ======================================================

const recommendBtn =
    document.getElementById(
        "recommendBtn"
    );


if (recommendBtn) {

    recommendBtn.addEventListener(
        "click",
        () => {

            const budget =
                Number(
                    document.getElementById(
                        "aiBudget"
                    )?.value
                );


            const type =
                document.getElementById(
                    "aiType"
                )?.value;


            const recommendationResult =
                document.getElementById(
                    "recommendResult"
                );


            const found =
                restaurants.filter(r => {

                    return (
                        (!budget ||
                            r.price <= budget) &&

                        (!type ||
                            type === "All" ||
                            r.type === type)
                    );

                });


            if (
                !recommendationResult
            ) {
                return;
            }


            if (found.length === 0) {

                recommendationResult.innerHTML =
                    `
                    <h3>
                        ❌ No restaurant found.
                    </h3>
                    `;

                return;
            }


            const best =
                [...found].sort(
                    (a, b) =>
                        b.rating -
                        a.rating
                )[0];


            recommendationResult.innerHTML =
                `

                <div class="restaurant-card">

                    <img
                        src="${escapeHTML(best.image)}"
                        class="restaurant-img"
                        alt="${escapeHTML(best.name)}"
                    >

                    <h3>
                        ${escapeHTML(best.name)}
                    </h3>

                    <p>
                        ⭐ ${best.rating}
                    </p>

                    <p>
                        📍 ${escapeHTML(best.location)}
                    </p>

                    <p>
                        💰 ₹${best.price}
                    </p>

                    <p>
                        🍽️ ${escapeHTML(best.type)}
                    </p>

                </div>

                `;

        }
    );
}


// ======================================================
// BOOKING
// ======================================================

const bookingForm =
    document.getElementById(
        "bookingForm"
    );


if (bookingForm) {

    bookingForm.addEventListener(
        "submit",
        function(e) {

            e.preventDefault();


            const name =
                document.getElementById(
                    "customerName"
                )?.value;


            const date =
                document.getElementById(
                    "bookingDate"
                )?.value;


            const time =
                document.getElementById(
                    "bookingTime"
                )?.value;


            const guests =
                document.getElementById(
                    "guests"
                )?.value;


            const booking = {

                name,

                date,

                time,

                guests

            };


            let bookings =
                JSON.parse(
                    localStorage.getItem(
                        "bookings"
                    )
                ) || [];


            bookings.push(
                booking
            );


            localStorage.setItem(
                "bookings",
                JSON.stringify(bookings)
            );


            const bookingMessage =
                document.getElementById(
                    "bookingMessage"
                );


            if (bookingMessage) {

                bookingMessage.innerHTML =
                    `
                    ✅ Booking confirmed for
                    <strong>
                        ${escapeHTML(name)}
                    </strong>

                    on
                    <strong>
                        ${escapeHTML(date)}
                    </strong>

                    at
                    <strong>
                        ${escapeHTML(time)}
                    </strong>

                    for
                    <strong>
                        ${escapeHTML(guests)}
                    </strong>
                    guest(s).
                    `;

            }


            bookingForm.reset();

        }
    );
}


// ======================================================
// THEME TOGGLE
// ======================================================

const themeBtn =
    document.getElementById(
        "themeBtn"
    );


if (themeBtn) {

    themeBtn.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "light"
            );

        }
    );
}


// ======================================================
// PROFILE
// ======================================================

function updateProfile() {

    const username =
        localStorage.getItem(
            "username"
        ) || "Guest";


    const profileNameEl =
        document.getElementById(
            "profileName"
        );


    if (profileNameEl) {

        profileNameEl.textContent =
            username;

    }


    // Favorites
    const favorites =
        JSON.parse(
            localStorage.getItem(
                "favorites"
            )
        ) || [];


    const favoriteCountEl =
        document.getElementById(
            "favoriteCount"
        );


    if (favoriteCountEl) {

        favoriteCountEl.textContent =
            favorites.length;

    }


    // Bookings
    const bookings =
        JSON.parse(
            localStorage.getItem(
                "bookings"
            )
        ) || [];


    const bookingCountEl =
        document.getElementById(
            "bookingCount"
        );


    if (bookingCountEl) {

        bookingCountEl.textContent =
            bookings.length;

    }


    // Reservations
    const reservationList =
        document.getElementById(
            "reservationList"
        );


    if (reservationList) {

        reservationList.innerHTML = "";


        bookings.forEach(b => {

            reservationList.innerHTML += `

                <div class="restaurant-card">

                    <h3>
                        ${escapeHTML(b.name)}
                    </h3>

                    <p>
                        📅 ${escapeHTML(b.date)}
                    </p>

                    <p>
                        🕒 ${escapeHTML(b.time)}
                    </p>

                    <p>
                        👥 ${escapeHTML(b.guests)}
                        Guests
                    </p>

                </div>

            `;

        });

    }
}


updateProfile();


// ======================================================
// START APPLICATION
// ======================================================

loadRestaurants();


