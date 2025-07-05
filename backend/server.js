const mongoose = require('mongoose');
const dotenv = require('dotenv');
const express=require("express")
;const cors=require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes")

// Load environment variables from .env file
dotenv.config();
const app=express();
app.use(
  cors({
    origin: process.env.client_URL || "*",
    methods: ["GET","POST","PUT","DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
)

app.use(express.json())

connectDB();
app.use("/api/v1/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`server running on port ${PORT}`));