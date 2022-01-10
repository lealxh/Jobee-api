const User = require("../models/user")
const CatchAsyncErrors = require("../middlewares/CatchAsyncErrors")
const ErrorHandler = require("../utils/ErrorHandler")
const sendToken = require("../utils/jwtoken")

//register new users => /api/V1/register
exports.registerUser = CatchAsyncErrors(async (req, res, next) => {
  const { name, email, password, role } = req.body

  const user = await User.create({
    name,
    email,
    password,
    role
  })

  sendToken(user, 200, res)
})

//Login user => /api/V1/login
exports.loginUser = CatchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400))
  }

  // Finding user in database
  const user = await User.findOne({ email }).select("+password")

  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password", 401))
  }

  // Check if password is correct
  const isPasswordMatched = await user.comparePassword(password)

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email or Password", 401))
  }

  sendToken(user, 200, res)
})
