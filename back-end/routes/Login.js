const express = require("express")
const router = express.Router()

// external imports
const LoginController = require("../controllers/Login.js")

// get requests
router.get("/login", LoginController.getLogin )


// post requests
router.post("/login", LoginController.postLogin)


module.exports = router