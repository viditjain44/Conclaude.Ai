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
app.use(cors());
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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});