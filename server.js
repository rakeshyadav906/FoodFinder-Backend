


const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
connectDB();


const app = express();
const PORT = process.env.PORT || 3000;

const restaurantRoutes = require("./routes/restaurants");

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/api/restaurants", restaurantRoutes);

app.get("/", (req, res) => {
  res.send("🚀 FoodFinder Backend is Running!");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

