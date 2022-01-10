const Job = require("../models/job")
const geocoder = require("../utils/geocoder")
const ErrorHandler = require("../utils/ErrorHandler")
const CatchAsyncErrors = require("../middlewares/CatchAsyncErrors")
const ApiFilters = require("../utils/ApiFilters")

const path = require("path")
const fs = require("fs")

//get all jobs=> /api/v1/jobs
exports.getJobs = CatchAsyncErrors(async (req, res, next) => {
  const apiFilter = new ApiFilters(Job.find(), req.query).filter().sort().fields().searchByQuery().pagination()

  const jobs = await apiFilter.query
  if (!jobs) {
    return next(new ErrorHandler("Job not found", 404))
  }

  res.status(200).json({
    success: true,
    results: jobs.length,
    data: jobs
  })
})

//create a new Job => /api/v1/job/new
exports.newJob = CatchAsyncErrors(async (req, res, next) => {
  //Adding user to body
  req.body.user = req.user.id
  console.log(req.user)

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

// Apply to job using Resume  =>  /api/v1/job/:id/apply
exports.applyJob = CatchAsyncErrors(async (req, res, next) => {
  let job = await Job.findById(req.params.id).select("+applicantsApplied")

  if (!job) {
    return next(new ErrorHandler("Job not found.", 404))
  }

  // Check that if job last date has been passed or not
  if (job.lastDate < new Date(Date.now())) {
    return next(new ErrorHandler("You can not apply to this job. Date is over.", 400))
  }

  // Check if user has applied before
  for (let i = 0; i < job.applicantsApplied.length; i++) {
    if (job.applicantsApplied[i].id === req.user.id) {
      return next(new ErrorHandler("You have already applied for this job.", 400))
    }
  }

  // Check the files
  if (!req.files) {
    return next(new ErrorHandler("Please upload file.", 400))
  }

  const file = req.files.file

  // Check file type
  const supportedFiles = /.docx|.pdf/
  if (!supportedFiles.test(path.extname(file.name))) {
    return next(new ErrorHandler("Please upload document file.", 400))
  }

  // Check doucument size
  if (file.size > process.env.MAX_FILE_SIZE) {
    return next(new ErrorHandler("Please upload file less than 2MB.", 400))
  }

  // Renaming resume
  file.name = `${req.user.name.replace(" ", "_")}_${job._id}${path.parse(file.name).ext}`

  file.mv(`${process.env.UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.log(err)
      return next(new ErrorHandler("Resume upload failed.", 500))
    }

    await Job.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          applicantsApplied: {
            id: req.user.id,
            resume: file.name
          }
        }
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false
      }
    )

    res.status(200).json({
      success: true,
      message: "Applied to Job successfully.",
      data: file.name
    })
  })
})
