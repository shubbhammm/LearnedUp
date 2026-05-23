const express = require('express');
const userRegestration = require('../controller/usercontroller');
const logincontroller = require('../controller/logincontroller');
const logoutcontroller = require('../controller/logoutcontroller');
const { authenticateToken, getUserProfile, checkAuth } = require('../middleware/auth');

const authRouter = express.Router();

// Public routes
authRouter.post("/register", userRegestration);
authRouter.post("/login", logincontroller);
authRouter.post("/logout", logoutcontroller);
authRouter.get("/check", checkAuth);

// Protected routes
authRouter.get("/profile", authenticateToken, getUserProfile);

module.exports = authRouter;