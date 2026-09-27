import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    thumbnailUrl: {
      type: String,
      required: [true, "Thumbnail URL is required"],
    },
    videoUrl: {
      type: String,
      required: [true, "Video URL is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "All",
        "Trending",
        "React",
        "JavaScript",
        "Gaming",
        "Music",
        "News",
        "Sports",
        "Education",
        "Technology",
        "Cooking",
        "Travel",
      ],
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId], // jin users ne like kiya unki ID list
      ref: "User",
      default: [],
    },
    dislikes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
  },
  { timestamps: true } // uploadDate ki jagah createdAt automatically milega
);

const Video = mongoose.model("Video", videoSchema);
export default Video;