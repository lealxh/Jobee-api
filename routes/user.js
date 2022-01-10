const express = require("express")
const router = express.Router()

const { getUserProfile, updatePassword, updateUser, deleteUser, getAppliedJobs, getPublishedJobs } = require("../controllers/userController")

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth")

router.route("/me").get(isAuthenticatedUser, getUserProfile)
router.route("/password/change").put(isAuthenticatedUser, updatePassword)
router.route("/me/update").put(isAuthenticatedUser, updateUser)
router.route("/me/delete").delete(isAuthenticatedUser, deleteUser)
router.route("/jobs/applied").get(isAuthenticatedUser, authorizeRoles("user"), getAppliedJobs)
router.route("/jobs/published").get(isAuthenticatedUser, authorizeRoles("employeer", "admin"), getPublishedJobs)
module.exports = router
