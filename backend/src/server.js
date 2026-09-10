const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const mastitisRoutes = require("./routes/mastitisRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/mastitis", mastitisRoutes);

app.get("/", (req, res) => {
  res.send({
    message: "Bovine Mastitis Early Warning Express Server",
    api_docs: "/api/mastitis/health"
  });
});

app.listen(PORT, () => {
  console.log(`[Express Backend] Server running on port ${PORT}`);
});
