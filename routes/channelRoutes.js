import express from "express";
import {
  createChannel,
  getChannelById,
  getMyChannel,
  updateChannel,
} from "../controllers/channelController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// ⚠️ Order important hai — "/my" "/:id" se PEHLE aana chahiye
// warna Express "my" ko :id maan lega aur ObjectId cast error dega
router.get("/my", protect, getMyChannel);
router.get("/:id", getChannelById);

router.post("/", protect, createChannel);
router.put("/:id", protect, updateChannel);

export default router;