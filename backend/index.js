require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db"); // Import database connection
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const githubRoutes = require("./routes/githubRoutes");
const projectRoutes = require("./routes/projectRoutes"); //
const userStoryRoutes = require("./routes/userStoryRoutes");
const codeAnalysisRoutes = require("./routes/codeAnalysisRoutes");
const documentRoutes = require("./routes/documentRoutes");
const developerRoutes = require("./routes/developerRoutes"); // Import developer routes

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "https://git-gpt-v2.vercel.app",
    credentials: true,
  })
);
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/user-stories", userStoryRoutes);
app.use("/api/code-analysis", codeAnalysisRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/developer", developerRoutes); // Use developer routes

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
