const express = require("express")
const router = express.Router()

//importing jobs controller
const { getJobs, newJob, getJobsInRadius, updateJob, deleteJob, getJob, getStats, applyJob } = require("../controllers/jobsController")
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth")

router.route("/jobs/:id/:slug").get(getJob)
router.route("/jobs").get(getJobs)
router.route("/jobs/:zipcode/:distance").get(getJobsInRadius)
router.route("/jobs/new").post(isAuthenticatedUser, authorizeRoles("employeer", "admin"), newJob)
router.route("/jobs/:id").put(isAuthenticatedUser, updateJob).delete(isAuthenticatedUser, deleteJob)
router.route("/jobs/:id/apply").put(isAuthenticatedUser, authorizeRoles("user"), applyJob)
router.route("/stats/:topic").get(getStats)

module.exports = router
