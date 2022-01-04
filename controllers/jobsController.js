const Job = require("../models/job")

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
