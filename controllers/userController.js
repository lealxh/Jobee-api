const User = require("../models/user")
const Job = require("../models/job")
const CatchAsyncErrors = require("../middlewares/CatchAsyncErrors")
const ErrorHandler = require("../utils/ErrorHandler")
const sendToken = require("../utils/jwtoken")
const path = require("path")
const fs = require("fs")
const { json } = require("express/lib/response")

// Get current user profile   =>    /api/v1/me
exports.getUserProfile = CatchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate({
    //to include virtual fields
    path: "jobsPublished",
    select: "title postingDate"
  })

  res.status(200).json({
    success: true,
    data: user
  })
})

// Update current user Password   =>    /api/v1/password/update
exports.updatePassword = CatchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password")

  // Check previous user password
  const isMatched = await user.comparePassword(req.body.currentPassword)
  if (!isMatched) {
    return next(new ErrorHandler("Old Password is incorrect.", 401))
  }

  user.password = req.body.newPassword
  await user.save()

  sendToken(user, 200, res)
})

// Update current user data   =>    /api/v1/me/update
exports.updateUser = CatchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  })

  res.status(200).json({
    success: true,
    data: user
  })
})

// Delete current user   =>    /api/v1/me/delete
exports.deleteUser = CatchAsyncErrors(async (req, res, next) => {
  deleteUserData(req.user.id, req.user.role)

  const user = await User.findByIdAndDelete(req.user.id)

  res.cookie("token", "none", {
    expires: new Date(Date.now()),
    httpOnly: true
  })

  res.status(200).json({
    success: true,
    message: "Your account has been deleted."
  })
})

// Delete user files and employeer jobs
async function deleteUserData(user, role) {
  if (role === "employeer") {
    await Job.deleteMany({ user: user })
  }

  if (role === "user") {
    const appliedJobs = await Job.find({ "applicantsApplied.id": user }).select("+applicantsApplied").select("+user")

    for (let i = 0; i < appliedJobs.length; i++) {
      let obj = appliedJobs[i].applicantsApplied.find(o => o.id === user)

      let filepath = `${__dirname}/public/uploads/${obj.resume}`.replace("\\controllers", "")
      fs.unlink(filepath, err => {
        if (err) return console.log(err)
      })

      appliedJobs[i].applicantsApplied.splice(appliedJobs[i].applicantsApplied.indexOf(obj.id))

      await appliedJobs[i].save()
    }
  }
}
