const express = require("express")
const app = express()
const dotenv = require("dotenv")
const ErrorMiddleware = require("./middlewares/Errors")

//setting up config
dotenv.config({ path: "./config/config.env" })

const connectDatabase = require("./config/database")

//connection to db
connectDatabase()

//set body parser
app.use(express.json())

//importing routes
const jobs = require("./routes/jobs")
app.use("/api/v1", jobs)

//midleware to handle errors
app.use(ErrorMiddleware)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Process started on port ${process.env.PORT} in ${process.env.NODE_ENV}`)
})
