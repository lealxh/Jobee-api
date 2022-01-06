const ErrorHandler = require("../utils/errorHandler")

module.exports = (err, req, res, next) => {
  console.log(err.message)
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
    let error = err

    // Wrong Mongoose Object ID Error
    if (err.name === "CastError") {
      const message = `Resource not found. Invalid: ${err.path}`
      error = new ErrorHandler(message, 404)
    }

    // Handling Mongoose Validation Error
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map(value => value.message)
      error = new ErrorHandler(message, 400)
    }

    // Handle mongoose duplicate key error
    if (err.code === 11000) {
      const message = `Duplicate ${Object.keys(err.keyValue)} entered.`
      error = new ErrorHandler(message, 400)
    }

    res.status(error.statusCode).json({
      success: false,
      message: error.message || "Internal Server Error."
    })
  }
}
