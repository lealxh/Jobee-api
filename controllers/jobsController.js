const Job = require("../models/job")
const geocoder = require("../utils/geocoder")

//get all jobs=> /api/v1/jobs
exports.getJobs = async (req, res, next) => {
  const allJobs = await Job.find()
  res.status(200).json({
    success: true,
    message: "This route will show all jobs",
    data: allJobs
  })
}

//create a new Job => /api/v1/job/new
exports.newJob = async (req, res, next) => {
  const jobData = await Job.create(req.body)
  res.status(200).json({
    success: true,
    message: "Job created",
    data: jobData
  })
}
//serch jobs in radius =>/api/v1/jobs/:zipcode/:distance
module.exports.getJobsInRadius = async (req, res, next) => {
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
}
//update job by id =>/api/v1/jobs/:id
module.exports.updateJob = async (req, res, next) => {
  const { id } = req.params

  let job = await Job.findById(id)

  if (!job)
    res.status(404).json({
      success: false,
      message: "Job not found"
    })
  else {
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
}
