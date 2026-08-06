const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    favorites: [{ type: Number }],
    watchLater: [{ type: Number }],
    avatarColor: { type: String, default: "#d4af37" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
