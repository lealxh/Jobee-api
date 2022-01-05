const express = require("express")
const router = express.Router()

//importing jobs controller
const { getJobs, newJob, getJobsInRadius, updateJob, deleteJob, getJob } = require("../controllers/jobsController")

router.route("/jobs/:id/:slug").get(getJob)
router.route("/jobs").get(getJobs)
router.route("/jobs/:zipcode/:distance").get(getJobsInRadius)
router.route("/jobs/new").post(newJob)
router.route("/jobs/:id").put(updateJob).delete(deleteJob)

module.exports = router
