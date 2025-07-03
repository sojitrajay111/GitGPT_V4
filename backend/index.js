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
const notificationRoutes = require('./routes/notificationRoutes');
const configurationRoutes = require("./routes/configurationRoutes");
const userManagementRoute = require("./routes/userManagementRoute");
const themeRoutes = require("./routes/themeRoutes");
const metricsRoutes = require("./routes/metricsRoutes");
const googleAuthRoutes = require("./routes/googleAuthRoutes");
const companyRoutes = require("./routes/companyRoutes");
const userRoutes = require("./routes/userRoutes");
const collaboratorRoutes = require("./routes/collaboratorRoutes");
const githubWebHookRoutes = require("./routes/GithubWebHook");

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
      "https://git-gpt-v2.vercel.app",
      "https://gitgpt-v3.vercel.app"
    ],
    credentials: true,
  })
);
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/configurations", configurationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/user-stories", userStoryRoutes);
app.use("/api/code-analysis", codeAnalysisRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/developer", developerRoutes); // Use developer routes
app.use('/api/notifications', notificationRoutes);
app.use("/api/metrics", metricsRoutes);
app.use("/api/user-management", userManagementRoute);
app.use("/api/google", googleAuthRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/theme", themeRoutes);
app.use("/api/collaborators", collaboratorRoutes );
app.use("/api/github", githubWebHookRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
