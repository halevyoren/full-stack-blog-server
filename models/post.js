const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  likes: [{ type: mongoose.Types.ObjectId, required: true, ref: "User" }],
  disLikes: [{ type: mongoose.Types.ObjectId, required: true, ref: "User" }],
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});
module.exports = mongoose.model("Post", postSchema);
