const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const usermodel = require('../schemas/userSchema');


const userRegestration = async (req,res)=>{
    const {name,email,password} = req.body;
    if(!name || !email || !password){
        return res.json({success:false,message:'missing details'})
    }
    try {
        const existingUser = await usermodel.findOne({email})
        if(existingUser){
            return res.json({
                success:false,
                message:"User already exist in the database"
            })
        }


        const hashedpassword = await bcrypt.hash(password,10);
        const user = new usermodel({name,email,password:hashedpassword})
        await user.save()


        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'})

        res.cookie("token",token,{
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            sameSite:process.env.NODE_ENV === 'production'? 'none' : 'strict',
            maxAge:7*24*60*60*1000  
        })
        return res.json({success:true})
        
    } catch (error) {
        res.json({
            success:false,
            message:error.message
        })
    }
}
module.exports= userRegestration