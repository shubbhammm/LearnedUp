const mongoose = require("mongoose")
const connectDb= async()=>{
    mongoose.connection.on("connected" , ()=>{
        console.log("database connected successfully")
    })
    await mongoose.connect(`${process.env.MONGODB_URI}/minar_project`)
}
module.exports= connectDb;