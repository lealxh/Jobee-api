const Job = require("../models/job")
const geocoder = require("../utils/geocoder")
const ErrorHandler = require("../utils/ErrorHandler")
const CatchAsyncErrors = require("../middlewares/CatchAsyncErrors")

//get all jobs=> /api/v1/jobs
exports.getJobs = CatchAsyncErrors(async (req, res, next) => {
  const allJobs = await Job.find()
  res.status(200).json({
    success: true,
    message: "This route will show all jobs",
    data: allJobs
  })
})

//create a new Job => /api/v1/job/new
exports.newJob = CatchAsyncErrors(async (req, res, next) => {
  const jobData = await Job.create(req.body)
  res.status(200).json({
    success: true,
    message: "Job created",
    data: jobData
  })
})
//serch jobs in radius =>/api/v1/jobs/:zipcode/:distance
module.exports.getJobsInRadius = CatchAsyncErrors(async (req, res, next) => {
  const { zipcode, distance } = req.params

  //getting latitude and longitude with geocoder
  const loc = await geocoder.geocode(zipcode)
  const latitude = loc[0].latitude
  const longitude = loc[0].longitude

  const radius = distance / 3963

  const jobs = await Job.find({
    location: { $geoWithin: { $centerSphere: [[longitude, latitude], radius] } }
  })

  res.status(200).json({
    success: true,
    results: jobs.length,
    data: jobs
  })
})
//delete job by id =>/api/v1/jobs/:id
module.exports.deleteJob = CatchAsyncErrors(async (req, res, next) => {
  const { id } = req.params

  let job = await Job.findById(id)
  if (!job)
    res.status(404).json({
      success: false,
      message: "Job not found"
    })
  else {
    await Job.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: "Job deleted"
    })
  }
})
// Get a single job with id and slug   =>  /api/v1/job/:id/:slug
exports.getJob = CatchAsyncErrors(async (req, res, next) => {
  console.log(req.params.id)
  console.log(req.params.slug)

  const job = await Job.find({ $and: [{ _id: req.params.id }, { slug: req.params.slug }] })

  if (!job)
    res.status(404).json({
      success: false,
      message: "Job not found"
    })
  else {
    res.status(200).json({
      success: true,
      data: job
    })
  }
})
// Get Job stats   =>  /api/v1/stats/:topic
//needs this index db.jobs.createIndex({title:"text"})
exports.getStats = CatchAsyncErrors(async (req, res, next) => {
  console.log(req.params.topic)
  const stats = await Job.aggregate([
    {
      $match: { $text: { $search: '"' + req.params.topic + '"' } }
    },
    {
      $group: {
        _id: { $toUpper: "$experience" },
        totalJobs: { $sum: 1 },
        avgPosition: { $avg: "$positions" },
        avgSalary: { $avg: "$salary" },
        minSalary: { $min: "$salary" },
        maxSalary: { $max: "$salary" }
      }
    }
  ])

  if (stats.length === 0)
    res.status(200).json({
      success: false,
      message: `No results found for ${req.params.topic}`
    })
  else
    res.status(200).json({
      success: true,
      data: stats
    })
})

//update job by id =>/api/v1/jobs/:id
module.exports.updateJob = CatchAsyncErrors(async (req, res, next) => {
  const { id } = req.params
  console.log(process.env.NODE_ENV)
  let job = await Job.findById(id)

  if (!job) {
    return next(new ErrorHandler("Job not found", 404))
  } else {
    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    res.status(200).json({
      success: true,
      message: "Job updated",
      data: job
    })
  }
})
