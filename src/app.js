require("dotenv").config();
const express = require("express");

const app = express();
const PORT = process.env.PORT || 8000;

// =========================
// Global Middlewares
// =========================

// parses incoming JSON payloads (Content-Type: application/json)
app.use(express.json());

// parses URL-encoded bodies (Standard form submissions)
app.use(express.urlencoded({ extended: true }));

// ================
// Routes
// ================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Jastip API is running smoothly.",
    timestamp: new Date().toISOString(),
  });
});

// =================================
// Fallback & Error Handling
// =================================

// 404 handler: catches requests that don't match any route
app.use((req, res, next) => {
  res.status(404).json({
    status: "error",
    message: `Route not found: ${req.originalUrl}`,
  });
});

// Global error handler: catches system crashes and errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`
        /$$$$$  /$$$$$$   /$$$$$$  /$$$$$$$$ /$$$$$$ /$$$$$$$         /$$$$$$  /$$$$$$$  /$$$$$$
       |__  $$ /$$__  $$ /$$__  $$|__  $$__/|_  $$_/| $$__  $$       /$$__  $$| $$__  $$|_  $$_/
          | $$| $$  \\ $$| $$  \\__/   | $$     | $$  | $$  \\ $$      | $$  \\ $$| $$  \\ $$  | $$  
          | $$| $$$$$$$$|  $$$$$$    | $$     | $$  | $$$$$$$/      | $$$$$$$$| $$$$$$$/  | $$  
     /$$  | $$| $$__  $$ \\____  $$   | $$     | $$  | $$____/       | $$__  $$| $$____/   | $$  
    | $$  | $$| $$  | $$ /$$  \\ $$   | $$     | $$  | $$            | $$  | $$| $$        | $$  
    |  $$$$$$/| $$  | $$|  $$$$$$/   | $$    /$$$$$$| $$            | $$  | $$| $$       /$$$$$$
     \\______/ |__/  |__/ \\______/    |__/   |______/|__/            |__/  |__/|__/      |______/
  `);
  console.log(`API running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
