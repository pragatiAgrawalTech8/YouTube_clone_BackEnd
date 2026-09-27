import Channel from "../models/Channel.js";
import User from "../models/User.js";

// ── @route  POST /api/channels  (protected) ──
export const createChannel = async (req, res) => {
  try {
    const { channelName, description, channelBanner } = req.body;

    if (!channelName) {
      return res.status(400).json({ message: "Channel name is required" });
    }

    // Check duplicate channel name
    const existing = await Channel.findOne({ channelName });
    if (existing) {
      return res.status(400).json({ message: "Channel name already taken" });
    }

    const channel = await Channel.create({
      channelName,
      description,
      channelBanner,
      owner: req.user._id,
    });

    // User ke channels array mein bhi add karo
    await User.findByIdAndUpdate(req.user._id, {
      $push: { channels: channel._id },
    });

    const populatedChannel = await channel.populate("owner", "username avatar");

    res.status(201).json(populatedChannel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @route  GET /api/channels/:id ──
export const getChannelById = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate("owner", "username avatar")
      .populate("videos");

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    res.status(200).json(channel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @route  GET /api/channels/my  (protected) ──
// Logged-in user ka khud ka channel laata hai
export const getMyChannel = async (req, res) => {
  try {
    const channel = await Channel.findOne({ owner: req.user._id })
      .populate("owner", "username avatar")
      .populate("videos");

    if (!channel) {
      return res.status(404).json({ message: "You don't have a channel yet" });
    }

    res.status(200).json(channel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @route  PUT /api/channels/:id  (protected) ──
export const updateChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }
    if (channel.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this channel" });
    }

    const { channelName, description, channelBanner } = req.body;
    channel.channelName = channelName || channel.channelName;
    channel.description = description ?? channel.description;
    channel.channelBanner = channelBanner || channel.channelBanner;

    const updated = await channel.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};