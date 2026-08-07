const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(
      "mongodb+srv://rakeshyadavn906_db_user:Rakesh906@cluster0.b6m9lyn.mongodb.net/foodfinder?retryWrites=true&w=majority&appName=Cluster0"
    );

    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.log("❌ MongoDB Connection Error:", err.message);
  }
}

module.exports = connectDB;


