require("dotenv").config();

// imports
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@as-integrations/express5");

// middleware
const errorHandler = require("./middlewares/errorHandler.js");

// db
const db = require("./models");

// routes
const customerRouter = require("./routes/customerRoutes.js");
const orderRouter = require("./routes/orderRoutes.js");
const itemRouter = require("./routes/itemRoutes.js");

const typeDefs = require("./graphql/schema.js");
const resolvers = require("./graphql/resolvers.js");

const app = express();
const PORT = process.env.PORT || 8000;

// =========================
// Global Middlewares
// =========================

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://192.168.0.10:3000",
    ],
    credentials: true,
  }),
);
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

// =============================
// GraphQL server
// =============================

async function startServer() {
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await apolloServer.start();

  app.use("/graphql", expressMiddleware(apolloServer));

  // =================================
  // Fallback & Error Handling
  // =================================

  app.use((req, res, next) => {
    const error = new Error(`Can't find ${req.originalUrl} on this server.`);
    error.statusCode = 404;
    next(error);
  });

  // Global error handler: catches system crashes and errors
  app.use(errorHandler);

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
        console.log(`GraphQL Sandbox: http://localhost:${PORT}/graphql`);
      });
    })
    .catch((err) => {
      // If db fails, crash the app immediately
      console.error("Unable to connect to DB:", err.message);
      process.exit(1);
    });
}

startServer();
