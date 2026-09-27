import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes    from "./routes/authRoutes.js";
import videoRoutes   from "./routes/videoRoutes.js";
import channelRoutes from "./routes/channelRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

dotenv.config();

const app = express();

// ── Middleware ──
app.use(cors());
app.use(express.json());

// ── Connect to MongoDB ──
connectDB();

// ── Routes ──
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/comments", commentRoutes);

// ── Test route ──
app.get("/", (req, res) => {
  res.send("YouTube Clone API is running...");
});

// ── Error handler (sabse end mein) ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});