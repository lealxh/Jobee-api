//get all jobs=> /api/v1/jobs
exports.getJobs = (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "This route will show all jobs"
  })
}
const Job = require("../models/job")

//create a new Job => /api/v1/jobs/new
exports.newJob = async (req, res, next) => {
  const jobData = await Job.create(req.body)
  res.status(200).json({
    success: true,
    message: "Job created",
    data: jobData
  })
}
