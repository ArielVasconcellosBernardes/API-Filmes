const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    movieId: { type: Number, required: true, index: true },
    author: { type: String, required: true },
    text: { type: String, required: true },
    seed: { type: Boolean, default: false },
    parentId: { type: String, default: null, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentSchema);
