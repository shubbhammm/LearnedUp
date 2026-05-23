const dotenv = require("dotenv")
dotenv.config()

// Fix: Override DNS to use Google's public DNS — local resolver blocks MongoDB SRV queries
const dns = require("dns")
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"])
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const connectDb = require("./connectiion/detabase")
const authRouter = require("./routes/authroute")
const videoRouter = require("./routes/videoroute")
const aiRouter = require("./routes/airoute")
const historyRouter = require("./routes/historyroute")

const app = express()
const port = process.env.PORT || 5000

connectDb()

// Basic middleware
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(cookieParser())
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}))

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' })
})

app.use('/api/auth', authRouter)
app.use('/api/video', videoRouter)
app.use('/api/ai', aiRouter)
app.use('/api/history', historyRouter)







// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
