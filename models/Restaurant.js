const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  name: String,
  location: String,
  price: Number,
  rating: Number,
  type: String,
  image: String
});

module.exports = mongoose.model("Restaurant", restaurantSchema);


