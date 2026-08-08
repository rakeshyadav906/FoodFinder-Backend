







let restaurants = [];

async function loadRestaurants() {
    try {
        const response = await fetch("/api/restaurants");

        if (!response.ok) {
            throw new Error("Failed to load restaurants");
        }

        const data = await response.json();

        restaurants = data.map(r => ({
            ...r,
            price: Number(r.price) || 0,
            rating: Number(r.rating) || 0,
            status: r.status || "Open",
            trending: r.trending !== false,
            type: r.type || "Other",
            phone: r.phone || "",
            website: r.website || "",
            menu: r.menu || [],
            image: r.image
                ? (r.image.startsWith("images/")
                    ? r.image
                    : "images/" + r.image)
                : "images/restaurant1.jpg"
        }));

        displayRestaurants(restaurants);
        showTrending();

        console.log("✅ Restaurants loaded from MongoDB:", restaurants);

    } catch (error) {
        console.error("❌ Error loading restaurants:", error);

        if (result) {
            result.innerHTML =
                "<h3>❌ Unable to load restaurants.</h3>";
        }
    }
}

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const result = document.getElementById("result");

loadRestaurants();
function searchRestaurants() {

    const city = searchInput.value.trim().toLowerCase();

    const filtered = restaurants.filter(function(r) {
        return r.location.toLowerCase().includes(city);
    });

    result.innerHTML = "";

    if (filtered.length === 0) {
        result.innerHTML = "<h3>No restaurants found.</h3>";
        return;
    }
  displayRestaurants(filtered);
}
function displayRestaurants(list){

    result.innerHTML = "";

    list.forEach(r => {

        result.innerHTML += `
<div class="restaurant-card">

<img src="${r.image}" class="restaurant-img">

<h3>${r.name}</h3>

<p>⭐ ${r.rating}</p>

<p>📍 ${r.location}</p>

<p>💰 ₹${r.price}</p>

<p>${r.status}</p>

<button onclick="showMenu(${restaurants.indexOf(r)})">
🍽 View Menu
</button>

<button onclick="window.location.href='tel:${r.phone}'">
📞 Call
</button>

<button onclick="window.open('${r.website}','_blank')">
🌐 Website
</button>

</div>
`;
    });
}

// 👇 Add this here
if (searchBtn && searchInput) {

    searchBtn.addEventListener("click", searchRestaurants);

    searchInput.addEventListener("keyup", function(event) {

        if (event.key === "Enter") {
            searchRestaurants();
        }

    });

}

function showRestaurant(name) {
    const details = document.getElementById("restaurantDetails");

    details.innerHTML = `
        <div class="details-card">
            <h2>${name}</h2>
            <p>🍽️ Delicious food with affordable prices.</p>
            <p>⭐ Highly rated by customers.</p>
            <button onclick="alert('Table booking feature coming soon!')">
                Book Table
            </button>
        </div>
    `;
}

const filterBtn = document.getElementById("filterBtn");

if (filterBtn) {

filterBtn.addEventListener("click", () => {
    const budget = document.getElementById("budgetFilter").value;
    const rating = document.getElementById("ratingFilter").value;
    const food = document.getElementById("foodFilter").value;

    const filtered = restaurants.filter(r => {

        let ok = true;

        if (budget && r.price > Number(budget))
            ok = false;

        if (rating && r.rating < Number(rating))
            ok = false;

        if (food && r.type !== food)
            ok = false;

        return ok;

    });

    displayRestaurants(filtered);

  });
}
function saveFavorite(name){

    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if(!favorites.includes(name)){

        favorites.push(name);

        localStorage.setItem("favorites", JSON.stringify(favorites));

        alert(name + " added to Favorites ❤️");

    }else{

        alert("Already in Favorites");

    }

}
const showFavorites = document.getElementById("showFavorites");

if (showFavorites) {

    showFavorites.addEventListener("click", function () {

        let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

        if (favorites.length === 0) {
            alert("No Favorite Restaurants");
            return;
        }

        alert("Your Favorites:\n\n" + favorites.join("\n"));

    });

}
const locationBtn = document.getElementById("locationBtn");
const userLocation = document.getElementById("userLocation");

if (locationBtn) {

    locationBtn.addEventListener("click", () => {

        if (navigator.geolocation) {

            navigator.geolocation.getCurrentPosition(showPosition);

        } else {

            userLocation.innerHTML = "Geolocation is not supported.";

        }

    });

}

function showPosition(position) {

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    userLocation.innerHTML =
    `📍 Latitude: ${latitude}<br>
     📍 Longitude: ${longitude}`;

}
const nearbyBtn = document.getElementById("nearbyBtn");

if (nearbyBtn) {

    nearbyBtn.addEventListener("click", () => {

        if (navigator.geolocation) {

            navigator.geolocation.getCurrentPosition(openNearbyRestaurants);

        } else {

            alert("Geolocation is not supported.");

        }

    });

}

function openNearbyRestaurants(position) {

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    const url =
        `https://www.google.com/maps/search/restaurants/@${latitude},${longitude},15z`;

    window.open(url, "_blank");

}
const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {

    loginBtn.addEventListener("click", () => {

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        if (username === "" || password === "") {

            alert("Please fill all fields!");

            return;
        }

        localStorage.setItem("username", username);

        alert("Welcome " + username + "!");

        window.location.href = "index.html";

    });
}
  function showDetails(r){

    alert("Button Clicked");

    document.getElementById("popup").style.display = "flex";

    document.getElementById("popupName").innerHTML = r.name;
    document.getElementById("popupLocation").innerHTML = "📍 " + r.location;
    document.getElementById("popupPrice").innerHTML = "💰 ₹" + r.price;
    document.getElementById("popupRating").innerHTML = "⭐ " + r.rating;
    document.getElementById("popupType").innerHTML = "🍽️ " + r.type;

  }
  

const closePopup = document.getElementById("closePopup");

if (closePopup) {

    closePopup.onclick = function () {

        document.getElementById("popup").style.display = "none";

    };

}
const reviewBtn = document.getElementById("reviewBtn");

if (reviewBtn) {

    reviewBtn.addEventListener("click", () => {

        const name = document.getElementById("userName").value;
        const rating = document.getElementById("userRating").value;
        const review = document.getElementById("userReview").value;

        if (name === "" || review === "") {
            alert("Please fill all fields!");
            return;
        }

        const reviews = JSON.parse(localStorage.getItem("reviews")) || [];

        reviews.push({
            name,
            rating,
            review
        });

        localStorage.setItem("reviews", JSON.stringify(reviews));

        displayReviews();

        document.getElementById("userName").value = "";
        document.getElementById("userReview").value = "";

    });
}
function displayReviews() {

    const reviewList = document.getElementById("reviewList");

    if (!reviewList) return;

    const reviews = JSON.parse(localStorage.getItem("reviews")) || [];

    reviewList.innerHTML = "";

    reviews.forEach(r => {

        reviewList.innerHTML += `
        <div class="review-card">
            <h3>${r.name}</h3>
            <p>⭐ ${r.rating}/5</p>
            <p>${r.review}</p>
        </div>
        `;

    });

}


      

displayReviews();
function showTrending(){

    const trendingList = document.getElementById("trendingList");

    if(!trendingList) return;

    trendingList.innerHTML = "";

    restaurants
        .filter(r => r.trending)
        .forEach(r => {

            trendingList.innerHTML += `
            <div class="trending-card">
                <h3>${r.name}</h3>
                <p>⭐ ${r.rating}</p>
                <p>📍 ${r.location}</p>
            </div>
            `;

        });

}

showTrending();
function showMenu(index){

let r = restaurants[index];

let menu = "🍽 MENU\n\n";

r.menu.forEach(item=>{

menu += item + "\n";

});

alert(menu);

}
const recommendBtn = document.getElementById("recommendBtn");

if(recommendBtn){

recommendBtn.addEventListener("click",()=>{

const budget = Number(document.getElementById("aiBudget").value);
const type = document.getElementById("aiType").value;

const result = document.getElementById("recommendResult");

const found = restaurants.filter(r=>{

return (!budget || r.price<=budget) &&
       (!type || r.type===type);

});

if(found.length===0){

result.innerHTML="<h3>❌ No restaurant found.</h3>";

return;

}

const best = found.sort((a,b)=>b.rating-a.rating)[0];

result.innerHTML=`
<div class="restaurant-card">

<img src="${best.image}" class="restaurant-img">

<h3>${best.name}</h3>

<p>⭐ ${best.rating}</p>

<p>📍 ${best.location}</p>

<p>💰 ₹${best.price}</p>

<p>🍽 ${best.type}</p>

</div>
`;

});

}
const bookingForm = document.getElementById("bookingForm");

if (bookingForm) {

    bookingForm.addEventListener("submit", function(e) {

        e.preventDefault();

        const name = document.getElementById("customerName").value;
        const date = document.getElementById("bookingDate").value;
        const time = document.getElementById("bookingTime").value;
        const guests = document.getElementById("guests").value;

        const booking = {
            name,
            date,
            time,
            guests
        };

        let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

        bookings.push(booking);

        localStorage.setItem("bookings", JSON.stringify(bookings));

        document.getElementById("bookingMessage").innerHTML =
        `✅ Booking confirmed for <strong>${name}</strong> on <strong>${date}</strong> at <strong>${time}</strong> for <strong>${guests}</strong> guest(s).`;

        bookingForm.reset();

    });

}
// Theme Toggle
const themeBtn = document.getElementById("themeBtn");

if (themeBtn) {

    themeBtn.addEventListener("click", () => {

        document.body.classList.toggle("light");

    });

}

// Update Profile
function updateProfile() {

    const username = localStorage.getItem("username") || "Guest";
    const profileNameEl = document.getElementById("profileName");
if (profileNameEl) {
  profileNameEl.textContent = username;
}

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];const favoriteCountEl = document.getElementById("favoriteCount");
if (favoriteCountEl) {
    favoriteCountEl.textContent = favorites.length;
}

const bookings =
JSON.parse(localStorage.getItem("bookings")) || [];

const bookingCountEl =
document.getElementById("bookingCount");

if (bookingCountEl) {
    bookingCountEl.textContent = bookings.length;
}
    const reservationList = document.getElementById("reservationList");

    if (reservationList) {

        reservationList.innerHTML = "";

        bookings.forEach(b => {

            reservationList.innerHTML += `
                <div class="restaurant-card">
                    <h3>${b.name}</h3>
                    <p>📅 ${b.date}</p>
                    <p>🕒 ${b.time}</p>
                    <p>👥 ${b.guests} Guests</p>
                </div>
            `;

        });

    }

}

updateProfile();


