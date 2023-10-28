const express = require("express")
const { registerUser, loginUser, allUsers } = require("../controller/userController")
const { protect } = require("../middlewares/authMiddleware")

const router=express.Router()

router.route("/").get(protect, allUsers);
router.route("/").post(registerUser)
router.post("/login",loginUser)

module.exports=router