export const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = { ...err };
  error.message = err.message;

  // Handle PostgreSQL Unique constraint violation
  if (err.code === "23505") {
    error.statusCode = 400;
    error.status = 'fail';
    error.message = 'A resource with this key/unique identifier already exists.';
  }

  // Handle PostgreSQL Data type validation error (invalid UUID or Serial integer)
  if (err.code === "22P02") {
    error.statusCode = 400;
    error.status = "fail";
    error.message = "Invalid item identifier or data format.";
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    error.statusCode = 401;
    error.status = "fail";
    error.message = "Invalid auth token. Please log in again.";
  }

  if (err.name === "TokenExpiredError") {
    error.statusCode = 401;
    error.status = "fail";
    error.message = "Your session expired. Please log in again.";
  }

  const isDev = process.env.NODE_ENV === "development";

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    ...(isDev && { stack: err.stack }),
  });
};
