const express = require("express")
const app = express()
const dotenv = require("dotenv")
const cookieParser = require("cookie-parser")
const ErrorMiddleware = require("./middlewares/Errors")
const ErrorHandler = require("./utils/errorHandler")

//setting up config
dotenv.config({ path: "./config/config.env" })

const connectDatabase = require("./config/database")

// Handling uncaught Exception
process.on("uncaughtException", err => {
  console.log(`Error: ${err.message}`)
  console.log("Shutting down the server due to uncaught Exception.")
  server.close(() => {
    process.exit(1)
  })
})

//connection to db
connectDatabase()

//set body parser
app.use(express.json())

//set up cookie parser
app.use(cookieParser())

//importing routes
const jobs = require("./routes/jobs")
const auth = require("./routes/auth")
const user = require("./routes/user")

app.use("/api/v1", jobs)
app.use("/api/v1", auth)
app.use("/api/v1", user)

app.all("*", (req, res, next) => {
  next(new ErrorHandler(`${req.originalUrl} route not found`, 404))
})

//midleware to handle errors
app.use(ErrorMiddleware)

const PORT = process.env.PORT
const server = app.listen(PORT, () => {
  console.log(`Process started on port ${process.env.PORT} in ${process.env.NODE_ENV}`)
})

// Handling Unhandled Promise Rejection
process.on("unhandledRejection", err => {
  console.log(`Error: ${err.message}`)
  console.log("Shutting down the server due to Unhandled promise rejection.")
  server.close(() => {
    process.exit(1)
  })
})
