import express from "express";
import {
  getVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  likeVideo,
  dislikeVideo,
} from "../controllers/videoController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Public ──
router.get("/", getVideos);
router.get("/:id", getVideoById);

// ── Protected (login required) ──
router.post("/", protect, createVideo);
router.put("/:id", protect, updateVideo);
router.delete("/:id", protect, deleteVideo);
router.put("/:id/like", protect, likeVideo);
router.put("/:id/dislike", protect, dislikeVideo);

export default router;