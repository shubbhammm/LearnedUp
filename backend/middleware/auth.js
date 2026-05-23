const jwt = require('jsonwebtoken');
const usermodel = require('../schemas/userSchema');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        
        if (!token) {
            return res.json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await usermodel.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.json({
                success: false,
                message: "Invalid token. User not found."
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.json({
            success: false,
            message: "Invalid token."
        });
    }
};

// Get current user profile
const getUserProfile = async (req, res) => {
    try {
        const user = await usermodel.findById(req.user._id).select('-password');
        return res.json({
            success: true,
            user: user
        });
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};

// Check if user is authenticated
const checkAuth = async (req, res) => {
    try {
        const token = req.cookies.token;
        
        if (!token) {
            return res.json({
                success: false,
                message: "Not authenticated"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await usermodel.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        return res.json({
            success: true,
            user: user
        });
    } catch (error) {
        return res.json({
            success: false,
            message: "Invalid token"
        });
    }
};

module.exports = {
    authenticateToken,
    getUserProfile,
    checkAuth
};