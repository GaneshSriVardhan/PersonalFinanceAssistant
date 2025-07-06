const mongoose = require('mongoose');
const dotenv = require('dotenv');
const express=require("express")
;const cors=require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes")
const transactionRoutes = require('./routes/transactionRoutes');
// Load environment variables from .env file
dotenv.config();
const app=express();
app.use(
  cors({
    origin: process.env.CLIENT_URL ,
    methods: ["GET","POST","PUT","DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
)
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

connectDB();
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/transactions", transactionRoutes);
// Basic route for testing
app.get('/', (req, res) => {
  res.send('Personal Finance Assistant API');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`server running on port ${PORT}`));