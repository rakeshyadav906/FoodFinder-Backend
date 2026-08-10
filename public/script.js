// ======================================================
// FOODFINDER - COMPLETE STAGE 2 SCRIPT
// Compatible with current index.html + style.css
// ======================================================

let restaurants = [];

const API_URL = "/api/restaurants";

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

const themeBtn = document.getElementById("themeBtn");


// ======================================================
// HTML ESCAPE
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
// NORMALIZE RESTAURANT DATA
// ======================================================

function normalizeRestaurant(r) {
    return {
        ...r,

        price: Number(r.price) || 0,

        rating: Number(r.rating) || 0,

        name: r.name || "Unknown Restaurant",

        location: r.location || "Location unavailable",

        type: r.type || "Other",

        image: r.image
            ? (
                r.image.startsWith("images/")
                    ? r.image
                    : "images/" + r.image
            )
            : "images/restaurant1.jpg",

        phone: r.phone || "",

        website: r.website || "",

        menu: Array.isArray(r.menu)
            ? r.menu
            : [],

        status: r.status || "Open",

        trending: r.trending !== false
    };
}


// ======================================================
// LOAD RESTAURANTS
// ======================================================

async function loadRestaurants(params = {}) {

    try {

        if (result) {
            result.innerHTML = `
                <div class="restaurant-card">
                    <h3>⏳ Loading restaurants...</h3>
                </div>
            `;
        }

        const query = new URLSearchParams();

        if (params.search) {
            query.set("search", params.search);
        }

        if (params.maxPrice) {
            query.set("maxPrice", params.maxPrice);
        }

        if (params.minRating) {
            query.set("minRating", params.minRating);
        }

        if (params.type) {
            query.set("type", params.type);
        }

        if (params.sort) {
            query.set("sort", params.sort);
        }

        const url = query.toString()
            ? `${API_URL}?${query.toString()}`
            : API_URL;

        console.log("🌐 Request:", url);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                `API Error: ${response.status}`
            );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error(
                "Invalid restaurant response"
            );
        }

        restaurants = data.map(
            normalizeRestaurant
        );

        console.log(
            "✅ Restaurants loaded:",
            restaurants
        );

        displayRestaurants(restaurants);

        showTrending();

        updateProfile();

    } catch (error) {

        console.error(
            "❌ Restaurant loading error:",
            error
        );

        if (result) {
            result.innerHTML = `
                <div class="restaurant-card">
                    <h3>❌ Unable to load restaurants</h3>
                    <p>Please refresh and try again.</p>
                </div>
            `;
        }
    }
}


// ======================================================
// DISPLAY SEARCH / FILTER RESULTS
// ======================================================

function displayRestaurants(list) {

    if (!result) {
        return;
    }

    result.innerHTML = "";

    if (!list || list.length === 0) {

        result.innerHTML = `
            <div class="restaurant-card">
                <h3>😔 No restaurants found</h3>
                <p>Try another search or filter.</p>
            </div>
        `;

        return;
    }

    list.forEach((r, index) => {

        result.innerHTML += `
            <div class="restaurant-card">

                <img
                    src="${escapeHTML(r.image)}"
                    class="restaurant-img"
                    alt="${escapeHTML(r.name)}"
                    onerror="this.src='images/restaurant1.jpg'"
                >

                <div class="restaurant-info">

                    <h3>
                        ${escapeHTML(r.name)}
                    </h3>

                    <p>
                        📍 ${escapeHTML(r.location)}
                    </p>

                    <p>
                        ⭐ ${r.rating.toFixed(1)}
                    </p>

                    <p>
                        💰 ₹${r.price}
                    </p>

                    <p>
                        🍽️ ${escapeHTML(r.type)}
                    </p>

                    <p class="${
                        r.status.toLowerCase() === "closed"
                            ? "closed"
                            : "open"
                    }">
                        ${
                            r.status.toLowerCase() === "closed"
                                ? "🔴 Closed"
                                : "🟢 Open"
                        }
                    </p>

                    <button
                        type="button"
                        onclick="showDetails(restaurants[${index}])"
                    >
                        👁️ View Details
                    </button>

                    <button
                        type="button"
                        onclick="saveFavorite('${escapeHTML(r.name)}')"
                    >
                        ❤️ Favorite
                    </button>

                    ${
                        r.phone
                            ? `
                                <button
                                    type="button"
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
                                    type="button"
                                    onclick="openWebsite('${escapeHTML(r.website)}')"
                                >
                                    🌐 Website
                                </button>
                            `
                            : ""
                    }

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

    if (!searchText) {

        loadRestaurants();

        return;
    }

    loadRestaurants({
        search: searchText
    });
}


if (searchBtn) {

    searchBtn.addEventListener(
        "click",
        searchRestaurants
    );

}


if (searchInput) {

    searchInput.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {
                event.preventDefault();
                searchRestaurants();
            }

        }
    );

}


// ======================================================
// FILTERS
// ======================================================

function applyFilters() {

    const params = {};

    const search =
        searchInput
            ? searchInput.value.trim()
            : "";

    const budget =
        budgetFilter
            ? budgetFilter.value
            : "";

    const rating =
        ratingFilter
            ? ratingFilter.value
            : "";

    const food =
        foodFilter
            ? foodFilter.value
            : "";


    if (search) {
        params.search = search;
    }

    if (budget) {
        params.maxPrice = budget;
    }

    if (rating) {
        params.minRating = rating;
    }

    if (food) {
        params.type = food;
    }


    console.log(
        "🔎 Applying filters:",
        params
    );


    loadRestaurants(params);
}


if (filterBtn) {

    filterBtn.addEventListener(
        "click",
        applyFilters
    );

}


// ======================================================
// CATEGORY CARDS
// ======================================================

const categoryCards =
    document.querySelectorAll(
        ".category-card"
    );


categoryCards.forEach(card => {

    card.addEventListener(
        "click",
        function() {

            const categoryName =
                this.querySelector("h3")
                    ?.textContent
                    .trim();

            if (!categoryName) {
                return;
            }

            console.log(
                "🍽️ Category:",
                categoryName
            );


            if (searchInput) {
                searchInput.value =
                    categoryName;
            }


            loadRestaurants({
                search: categoryName
            });

        }
    );

});


// ======================================================
// THEME TOGGLE
// ======================================================

function applySavedTheme() {

    const theme =
        localStorage.getItem(
            "foodfinderTheme"
        );

    if (theme === "light") {

        document.body.classList.add(
            "light"
        );

        if (themeBtn) {
            themeBtn.textContent = "☀️";
        }

    } else {

        document.body.classList.remove(
            "light"
        );

        if (themeBtn) {
            themeBtn.textContent = "🌙";
        }
    }
}


if (themeBtn) {

    themeBtn.addEventListener(
        "click",
        function() {

            document.body.classList.toggle(
                "light"
            );

            const isLight =
                document.body.classList.contains(
                    "light"
                );

            localStorage.setItem(
                "foodfinderTheme",
                isLight
                    ? "light"
                    : "dark"
            );

            themeBtn.textContent =
                isLight
                    ? "☀️"
                    : "🌙";

        }
    );

}


applySavedTheme();


// ======================================================
// SHOW RESTAURANT DETAILS
// ======================================================

function showRestaurant(name) {

    const details =
        document.getElementById(
            "restaurantDetails"
        );

    if (!details) {
        return;
    }

    const restaurant =
        restaurants.find(
            r => r.name === name
        );


    if (restaurant) {

        showDetails(restaurant);

        return;
    }


    details.innerHTML = `
        <div class="details-card">

            <h2>
                ${escapeHTML(name)}
            </h2>

            <p>
                🍽️ Delicious food with
                affordable prices.
            </p>

            <p>
                ⭐ Highly rated restaurant.
            </p>

        </div>
    `;

}


window.showRestaurant =
    showRestaurant;


// ======================================================
// VIEW DETAILS POPUP
// ======================================================

function showDetails(restaurant) {

    if (!restaurant) {

        alert(
            "Restaurant details unavailable."
        );

        return;
    }

    const popup =
        document.getElementById(
            "popup"
        );

    if (!popup) {
        return;
    }


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
            restaurant.name;
    }

    if (popupLocation) {
        popupLocation.textContent =
            "📍 " +
            restaurant.location;
    }

    if (popupPrice) {
        popupPrice.textContent =
            "💰 ₹" +
            restaurant.price;
    }

    if (popupRating) {
        popupRating.textContent =
            "⭐ " +
            restaurant.rating;
    }

    if (popupType) {
        popupType.textContent =
            "🍽️ " +
            restaurant.type;
    }


    popup.style.display =
        "flex";
}


window.showDetails =
    showDetails;


// ======================================================
// CLOSE POPUP
// ======================================================

const closePopup =
    document.getElementById(
        "closePopup"
    );


if (closePopup) {

    closePopup.addEventListener(
        "click",
        function() {

            const popup =
                document.getElementById(
                    "popup"
                );

            if (popup) {
                popup.style.display =
                    "none";
            }

        }
    );

}


// Close popup by clicking outside
const popup =
    document.getElementById(
        "popup"
    );


if (popup) {

    popup.addEventListener(
        "click",
        function(event) {

            if (event.target === popup) {

                popup.style.display =
                    "none";

            }

        }
    );

}


// ======================================================
// FAVORITES
// ======================================================

function saveFavorite(name) {

    let favorites =
        JSON.parse(
            localStorage.getItem(
                "favorites"
            )
        ) || [];


    if (!favorites.includes(name)) {

        favorites.push(name);

        localStorage.setItem(
            "favorites",
            JSON.stringify(
                favorites
            )
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


    updateProfile();
}


window.saveFavorite =
    saveFavorite;


// ======================================================
// SHOW FAVORITES
// ======================================================

const showFavorites =
    document.getElementById(
        "showFavorites"
    );


if (showFavorites) {

    showFavorites.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            const favorites =
                JSON.parse(
                    localStorage.getItem(
                        "favorites"
                    )
                ) || [];


            if (favorites.length === 0) {

                alert(
                    "No Favorite Restaurants ❤️"
                );

                return;
            }


            alert(
                "❤️ Your Favorites:\n\n" +
                favorites.join("\n")
            );

        }
    );

}


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
        function() {

            if (!navigator.geolocation) {

                if (userLocation) {
                    userLocation.textContent =
                        "❌ Geolocation is not supported.";
                }

                return;
            }


            navigator.geolocation.getCurrentPosition(
                showPosition,
                locationError
            );

        }
    );

}


function showPosition(position) {

    const latitude =
        position.coords.latitude;

    const longitude =
        position.coords.longitude;


    if (userLocation) {

        userLocation.innerHTML = `
            📍 Latitude: ${latitude}<br>
            📍 Longitude: ${longitude}
        `;

    }

}


function locationError(error) {

    if (!userLocation) {
        return;
    }


    if (
        error.code ===
        error.PERMISSION_DENIED
    ) {

        userLocation.textContent =
            "❌ Location permission denied.";

    } else {

        userLocation.textContent =
            "❌ Unable to get your location.";

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
        function() {

            if (!navigator.geolocation) {

                alert(
                    "Geolocation is not supported."
                );

                return;
            }


            navigator.geolocation.getCurrentPosition(
                openNearbyRestaurants,
                locationError
            );

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
// AI RECOMMENDATION
// ======================================================

const recommendBtn =
    document.getElementById(
        "recommendBtn"
    );


if (recommendBtn) {

    recommendBtn.addEventListener(
        "click",
        function() {

            const budgetInput =
                document.getElementById(
                    "aiBudget"
                );

            const typeInput =
                document.getElementById(
                    "aiType"
                );

            const recommendationResult =
                document.getElementById(
                    "recommendResult"
                );


            if (!recommendationResult) {
                return;
            }


            const budget =
                budgetInput
                    ? Number(
                        budgetInput.value
                    )
                    : 0;


            const type =
                typeInput
                    ? typeInput.value
                    : "";


            const found =
                restaurants.filter(
                    function(r) {

                        const budgetOK =
                            !budget ||
                            r.price <= budget;


                        const typeOK =
                            !type ||
                            r.type
                                .toLowerCase()
                                .includes(
                                    type.toLowerCase()
                                );


                        return (
                            budgetOK &&
                            typeOK
                        );

                    }
                );


            if (found.length === 0) {

                recommendationResult.innerHTML = `
                    <div class="restaurant-card">

                        <h3>
                            ❌ No restaurant found
                        </h3>

                        <p>
                            Try another budget
                            or food type.
                        </p>

                    </div>
                `;

                return;
            }


            const best =
                [...found].sort(
                    function(a, b) {

                        return (
                            b.rating -
                            a.rating
                        );

                    }
                )[0];


            recommendationResult.innerHTML = `
                <div class="restaurant-card">

                    <img
                        src="${escapeHTML(best.image)}"
                        class="restaurant-img"
                        alt="${escapeHTML(best.name)}"
                        onerror="this.src='images/restaurant1.jpg'"
                    >

                    <div class="restaurant-info">

                        <h3>
                            🤖 ${escapeHTML(best.name)}
                        </h3>

                        <p>
                            📍 ${escapeHTML(best.location)}
                        </p>

                        <p>
                            ⭐ ${best.rating.toFixed(1)}
                        </p>

                        <p>
                            💰 ₹${best.price}
                        </p>

                        <p>
                            🍽️ ${escapeHTML(best.type)}
                        </p>

                        <button
                            type="button"
                            id="recommendDetailsBtn"
                        >
                            👁️ View Details
                        </button>

                    </div>

                </div>
            `;


            const detailsBtn =
                document.getElementById(
                    "recommendDetailsBtn"
                );


            if (detailsBtn) {

                detailsBtn.addEventListener(
                    "click",
                    function() {

                        showDetails(best);

                    }
                );

            }

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
        function(event) {

            event.preventDefault();


            const name =
                document.getElementById(
                    "customerName"
                )?.value.trim();


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


            if (
                !name ||
                !date ||
                !time ||
                !guests
            ) {

                alert(
                    "Please fill all booking fields."
                );

                return;
            }


            const booking = {

                name,
                date,
                time,
                guests

            };


            const bookings =
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
                JSON.stringify(
                    bookings
                )
            );


            const message =
                document.getElementById(
                    "bookingMessage"
                );


            if (message) {

                message.innerHTML = `
                    ✅ Booking confirmed for
                    <strong>${escapeHTML(name)}</strong>
                    on
                    <strong>${escapeHTML(date)}</strong>
                    at
                    <strong>${escapeHTML(time)}</strong>
                    for
                    <strong>${escapeHTML(guests)}</strong>
                    guest(s).
                `;

            }


            bookingForm.reset();

            updateProfile();

        }
    );

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
        function() {

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
                JSON.stringify(
                    reviews
                )
            );


            document.getElementById(
                "userName"
            ).value = "";


            document.getElementById(
                "userReview"
            ).value = "";


            displayReviews();

        }
    );

}


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


    reviews.forEach(
        function(r) {

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

        }
    );

}


displayReviews();


// ======================================================
// TRENDING
// ======================================================

function showTrending() {

    const trendingList =
        document.getElementById(
            "trendingList"
        );


    if (!trendingList) {
        return;
    }


    trendingList.innerHTML = "";


    const trending =
        restaurants.filter(
            r => r.trending
        );


    trending.forEach(
        function(r) {

            trendingList.innerHTML += `
                <div class="trending-card">

                    <h3>
                        ${escapeHTML(r.name)}
                    </h3>

                    <p>
                        ⭐ ${r.rating.toFixed(1)}
                    </p>

                    <p>
                        📍 ${escapeHTML(r.location)}
                    </p>

                    <p>
                        🍽️ ${escapeHTML(r.type)}
                    </p>

                </div>
            `;

        }
    );

}


// ======================================================
// CALL / WEBSITE
// ======================================================

function callRestaurant(phone) {

    if (!phone) {

        alert(
            "Phone number unavailable."
        );

        return;
    }

    window.location.href =
        "tel:" + phone;
}


window.callRestaurant =
    callRestaurant;


function openWebsite(website) {

    if (!website) {

        alert(
            "Website unavailable."
        );

        return;
    }


    let url =
        website.trim();


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
// PROFILE
// ======================================================

function updateProfile() {

    const username =
        localStorage.getItem(
            "username"
        ) || "Guest";


    const profileName =
        document.getElementById(
            "profileName"
        );


    if (profileName) {

        profileName.textContent =
            username;

    }


    const favorites =
        JSON.parse(
            localStorage.getItem(
                "favorites"
            )
        ) || [];


    const favoriteCount =
        document.getElementById(
            "favoriteCount"
        );


    if (favoriteCount) {

        favoriteCount.textContent =
            favorites.length;

    }


    const bookings =
        JSON.parse(
            localStorage.getItem(
                "bookings"
            )
        ) || [];


    const bookingCount =
        document.getElementById(
            "bookingCount"
        );


    if (bookingCount) {

        bookingCount.textContent =
            bookings.length;

    }


    const reservationList =
        document.getElementById(
            "reservationList"
        );


    if (!reservationList) {
        return;
    }


    reservationList.innerHTML = "";


    bookings.forEach(
        function(booking) {

            reservationList.innerHTML += `
                <div class="restaurant-card">

                    <h3>
                        ${escapeHTML(booking.name)}
                    </h3>

                    <p>
                        📅 ${escapeHTML(booking.date)}
                    </p>

                    <p>
                        🕒 ${escapeHTML(booking.time)}
                    </p>

                    <p>
                        👥 ${escapeHTML(booking.guests)}
                        Guest(s)
                    </p>

                </div>
            `;

        }
    );

}


updateProfile();


// ======================================================
// INITIAL LOAD
// ======================================================

loadRestaurants();

console.log(
    "🚀 FoodFinder Stage 2 loaded successfully"
);

