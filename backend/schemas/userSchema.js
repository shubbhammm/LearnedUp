const mongoose = require("mongoose")
const userschema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    status:{
        type: Boolean,
        default: false
    },
    loginHistory: [{
        timestamp: { type: Date, default: Date.now },
        ip: String,
        userAgent: String
    }]
}, {
    timestamps: true
})

const usermodel =mongoose.model.User || mongoose.model("User", userschema)
module.exports = usermodel