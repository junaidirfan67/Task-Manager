const dotenv = require("dotenv");

dotenv.config();

const cors = require("cors");
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://[::1]:5173",
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",").map((origin) => origin.trim()) : [])
].filter(Boolean);

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "replace_with_a_long_random_secret") {
  process.env.JWT_SECRET = "dev-only-task-manager-secret";
  console.warn("JWT_SECRET is missing. Using a dev-only fallback secret.");
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "task-manager-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Server error";

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource id";
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate value already exists";
  }

  res.status(statusCode).json({
    message
  });
});

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
