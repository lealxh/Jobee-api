const express = require("express")
const router = express.Router()

//importing jobs controller
const { getJobs, newJob, getJobsInRadius, updateJob } = require("../controllers/jobsController")

router.route("/jobs").get(getJobs)
router.route("/jobs/:zipcode/:distance").get(getJobsInRadius)
router.route("/jobs/new").post(newJob)
router.route("/jobs/:id").put(updateJob)

module.exports = router
