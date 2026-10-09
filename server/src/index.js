import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import complaintsRouter from "./routes/complaints.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});
app.use("/api/complaints", complaintsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
  res.status(500).json({ message: "Something went wrong on the server." });
});

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error("Missing MONGODB_URI. Create server/.env using server/.env.example.");
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
    app.listen(PORT, "0.0.0.0", () => console.log(`API running on http://localhost:${PORT}`));
  } catch (error) {
    console.error("Could not connect to MongoDB. Check that MongoDB is running and MONGODB_URI is correct.");
    console.error(error.message);
    process.exit(1);
  }
}
start();
