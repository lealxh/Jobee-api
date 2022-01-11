const express = require("express")
const app = express()
const dotenv = require("dotenv")
const cookieParser = require("cookie-parser")
const ErrorMiddleware = require("./middlewares/Errors")
const ErrorHandler = require("./utils/errorHandler")
const fileUpload = require("express-fileupload")
const rateLimit = require("express-rate-limit")
const helmet = require("helmet")
const mongoSanitize = require("express-mongo-sanitize")
const xssClean = require("xss-clean")
const hpp = require("hpp")
const cors = require("cors")
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

//setting up security headers
app.use(helmet())

//set body parser
app.use(express.json())

//sanitize data
app.use(mongoSanitize())

//prevent xss attacks
app.use(xssClean())

//prevent parameters polution
app.use(hpp())

//enabling cors
app.use(cors())
//set up cookie parser
app.use(cookieParser())

//set up file uploader
app.use(fileUpload())

//rate limiting
const limiter = rateLimit({
  windowMS: 10 * 60 * 10, //10 min,
  max: 100
})
app.use(limiter)

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
