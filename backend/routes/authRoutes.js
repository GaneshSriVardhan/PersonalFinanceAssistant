const express = require("express");
const auth = require('../middleware/auth');
const {
    registerUser,
    loginUser,
    getUserInfo,
    verifyEmail,
}= require("../controllers/authControllers");

const router = express.Router();

router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/getUser",auth, getUserInfo);
router.get('/verify-email', verifyEmail);

module.exports = router;