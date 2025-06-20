const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI ||
        "mongodb+srv://raj123:xCBOJ7bAuLpbM4EP@cluster0.dxinnn1.mongodb.net/GitGPT"
    );
    console.log("MongoDB connected successfully");

    mongoose.connection.once("open", () => {
      console.log("🚀 Connected to MongoDB");
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
