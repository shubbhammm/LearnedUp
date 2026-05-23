const logoutcontroller = async (req,res)=>{
    try {
        res.clearCookie('token',{
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            sameSite:process.env.NODE_ENV === 'production'? 'none' : 'strict',
        })

        return res.json({success:true,message:"Logged out "})
    } catch (error) {
        return res.json({success:false,message:error.message})
    }
}
module.exports=logoutcontroller