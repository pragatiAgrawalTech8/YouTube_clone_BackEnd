import Video from "../models/Video.js";
import Channel from "../models/Channel.js";

// ── @route  GET /api/videos ──
// Saare videos fetch karo, optional category/search filter ke saath
export const getVideos = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== "All") {
      filter.category = category;
    }
    if (search) {
      filter.title = { $regex: search, $options: "i" }; // case-insensitive search
    }

    const videos = await Video.find(filter)
      .populate("channelId", "channelName")
      .populate("uploader", "username")
      .sort({ createdAt: -1 });

    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @route  GET /api/videos/:id ──
export const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate("channelId", "channelName channelBanner")
      .populate("uploader", "username avatar");

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // View count badhao har baar video khulne par
    video.views += 1;
    await video.save();

    res.status(200).json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @route  POST /api/videos  (protected) ──
export const createVideo = async (req, res) => {
  try {
    const { title, description, thumbnailUrl, videoUrl, category, channelId } = req.body;

    if (!title || !thumbnailUrl || !videoUrl || !category || !channelId) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Check karo yeh channel isi user ka hai
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }
    if (channel.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to upload to this channel" });
    }

    const video = await Video.create({
      title,
      description,
      thumbnailUrl,
      videoUrl,
      category,
      channelId,
      uploader: req.user._id,
    });

    // Channel ke videos array mein bhi add karo
    channel.videos.push(video._id);
    await channel.save();

    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @route  PUT /api/videos/:id  (protected) ──
export const updateVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    if (video.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this video" });
    }

    const { title, description, thumbnailUrl, category } = req.body;
    video.title        = title        || video.title;
    video.description  = description  ?? video.description;
    video.thumbnailUrl  = thumbnailUrl || video.thumbnailUrl;
    video.category      = category     || video.category;

    const updated = await video.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @route  DELETE /api/videos/:id  (protected) ──
export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    if (video.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this video" });
    }

    // Channel ke videos array se bhi hatao
    await Channel.findByIdAndUpdate(video.channelId, { $pull: { videos: video._id } });
    await video.deleteOne();

    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @route  PUT /api/videos/:id/like  (protected) ──
export const likeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const userId = req.user._id.toString();
    const alreadyLiked    = video.likes.some((id) => id.toString() === userId);
    const alreadyDisliked = video.dislikes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      // Dobara like dabaya → like hatao (toggle off)
      video.likes = video.likes.filter((id) => id.toString() !== userId);
    } else {
      video.likes.push(userId);
      if (alreadyDisliked) {
        video.dislikes = video.dislikes.filter((id) => id.toString() !== userId);
      }
    }

    await video.save();
    res.status(200).json({ likes: video.likes.length, dislikes: video.dislikes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @route  PUT /api/videos/:id/dislike  (protected) ──
export const dislikeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const userId = req.user._id.toString();
    const alreadyDisliked = video.dislikes.some((id) => id.toString() === userId);
    const alreadyLiked    = video.likes.some((id) => id.toString() === userId);

    if (alreadyDisliked) {
      video.dislikes = video.dislikes.filter((id) => id.toString() !== userId);
    } else {
      video.dislikes.push(userId);
      if (alreadyLiked) {
        video.likes = video.likes.filter((id) => id.toString() !== userId);
      }
    }

    await video.save();
    res.status(200).json({ likes: video.likes.length, dislikes: video.dislikes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};