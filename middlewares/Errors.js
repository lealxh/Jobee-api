const ErrorHandler = require("../utils/errorHandler")

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.message = err.message || "Internal Server Error"

  if (process.env.NODE_ENV.trim() == "development") {
    res.status(err.statusCode).json({
      success: false,
      error: err,
      message: err.message,
      stack: err.stack
    })
  }
  if (process.env.NODE_ENV.trim() == "production") {
    let error = { ...err }

    res.status(error.statusCode).json({
      success: false,
      message: error.message || "Internal Server Error."
    })
  }
}
