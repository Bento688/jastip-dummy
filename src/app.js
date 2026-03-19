require("dotenv").config();

// imports
const express = require("express");
const morgan = require("morgan");

// db
const db = require("./models");

// routes
const customerRouter = require("./routes/customerRoutes.js");
const orderRouter = require("./routes/orderRoutes.js");
const itemRouter = require("./routes/itemRoutes.js");

const app = express();
const PORT = process.env.PORT || 8000;

// =========================
// Global Middlewares
// =========================

app.use(morgan("dev"));
app.use(express.json());
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

app.use("/api/customers", customerRouter);
app.use("/api/orders", orderRouter);
app.use("/api/items", itemRouter);

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

// ==================================
// DB CONNECTION & SERVER LISTENING
// ==================================

// test connection
db.sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection pool established successfully.");

    // Only start listening for HTTP requests if the database is alive
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
  })
  .catch((err) => {
    // If db fails, crash the app immediately
    console.error("Unable to connect to DB:", err.message);
    process.exit(1);
  });
