const usermodel = require("../schemas/userSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const logincontroller = async (req,res)=>{
    const {email,password}=req.body;
    if(!email || !password){
        return res.json({success:false,message:"Email and password are required"})
    }   
    try {
        const user= await usermodel.findOne({email})
        if(!user){
            return res.json({success:false,message:"Invalid Email"})
        }
        const ismatch = await bcrypt.compare(password,user.password)

        if(!ismatch){
            return res.json({success:false, message:"Password is incorrect"})
        }
        
        // Track login history
        user.loginHistory.push({
            timestamp: new Date(),
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent']
        });
        await user.save();

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'})
        
        res.cookie("token",token,{
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            sameSite:process.env.NODE_ENV === 'production'? 'none' : 'strict',
            maxAge:7*24*60*60*1000  
        })
        return res.json({success:true})


    } catch (error) {
        res.json({success:false,message:error.message})
    }

}
module.exports= logincontroller