const mongoose = require("mongoose");
const connectDB = require("./db");
const Restaurant = require("./models/Restaurant");

async function seed() {
  await connectDB();

  await Restaurant.deleteMany({});

  await Restaurant.create([
    {
      name: "Paradise Biryani",
      location: "Hyderabad",
      price: 250,
      rating: 4.5,
      type: "Biryani",
      image: "paradise.jpg"
    },
    {
      name: "Pizza Hut",
      location: "Hyderabad",
      price: 300,
      rating: 4.2,
      type: "Pizza",
      image: "pizzahut.jpg"
    }
  ]);

  console.log("✅ Restaurants Added");
  mongoose.connection.close();
}

seed();

