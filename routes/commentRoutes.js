import express from "express";
import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Public ──
router.get("/:videoId", getComments);

// ── Protected ──
router.post("/:videoId", protect, addComment);
router.put("/:id", protect, updateComment);
router.delete("/:id", protect, deleteComment);

export default router;