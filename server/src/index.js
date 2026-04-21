require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

// Routes import
const brandsRoute = require("./routes/brands");
const conversationsRoute = require("./routes/conversations");
const insightsRoute = require("./routes/insights");

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/brands", brandsRoute);
app.use("/api/conversations", conversationsRoute);
app.use("/api/insights", insightsRoute);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Helio Insights API running!" });
});

const PORT = process.env.PORT || 5000;

// Update this part to increase timeout
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// INCREASE TIMEOUT TO 60 SECONDS
// AI generation (Llama 3.3) needs more time than a standard API call
server.timeout = 60000;