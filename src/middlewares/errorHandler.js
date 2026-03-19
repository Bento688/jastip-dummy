const errorHandler = (err, req, res, next) => {
  // Log the error to the terminal
  console.error(`[ERROR]: ${err.name} - ${err.message}`);

  let statusCode = err.statusCode || 500; // assume 500 until known otherwise
  let message = err.message || "Internal Server Error";
  let status = `${statusCode}`.startsWith("4") ? "fail" : "error";

  // Intercept specific database errors that bypassed the controllers
  if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError"
  ) {
    statusCode = 400;
    status = "fail";
    message = err.errors.map((e) => e.message).join(", ");
  }

  if (err.name === "SequelizeForeignKeyConstraintError") {
    statusCode = 400;
    status = "fail";
    message = "Database relation constraint violated. Check your UUIDs.";
  }

  // Send standardized JSON payload
  res.status(statusCode).json({
    status,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = errorHandler;
