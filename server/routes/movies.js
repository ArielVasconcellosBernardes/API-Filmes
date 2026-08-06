const router = require("express").Router();
const User = require("../models/User");
const Comment = require("../models/Comment");

router.get("/comments/:movieId", async (req, res) => {
  const movieId = Number(req.params.movieId);
  const comments = await Comment.find({ movieId }).sort({ createdAt: -1 });
  if (!comments.length) {
    await Comment.insertMany([
      { movieId, author: "Equipe", text: "Filme excelente para começar a maratona.", seed: true },
      { movieId, author: "Equipe", text: "Vale assistir com calma e apreciar os detalhes.", seed: true },
    ]);
    return res.json(await Comment.find({ movieId }).sort({ createdAt: -1 }));
  }
  res.json(comments);
});

router.post("/comments/:movieId", async (req, res) => {
  const movieId = Number(req.params.movieId);
  const { author, text, parentId = null } = req.body;
  const comment = await Comment.create({ movieId, author, text, parentId });
  res.status(201).json(comment);
});

router.get("/favorites/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId);
  res.json({ favorites: user?.favorites || [] });
});

router.post("/favorites/:userId", async (req, res) => {
  const { movieId } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { $addToSet: { favorites: movieId } },
    { new: true }
  );
  res.json({ favorites: user.favorites });
});

router.delete("/favorites/:userId/:movieId", async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { $pull: { favorites: Number(req.params.movieId) } },
    { new: true }
  );
  res.json({ favorites: user.favorites });
});

router.get("/watch-later/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId);
  res.json({ watchLater: user?.watchLater || [] });
});

router.post("/watch-later/:userId", async (req, res) => {
  const { movieId } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { $addToSet: { watchLater: movieId } },
    { new: true }
  );
  res.json({ watchLater: user.watchLater || [] });
});

router.delete("/watch-later/:userId/:movieId", async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { $pull: { watchLater: Number(req.params.movieId) } },
    { new: true }
  );
  res.json({ watchLater: user.watchLater || [] });
});

router.patch("/profile/:userId", async (req, res) => {
  const { name, email, avatarColor } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { ...(name ? { name } : {}), ...(email ? { email } : {}), ...(avatarColor ? { avatarColor } : {}) },
    { new: true }
  );
  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    favorites: user.favorites || [],
    watchLater: user.watchLater || [],
    avatarColor: user.avatarColor,
  });
});

router.get("/genres/:genreId", async (req, res) => {
  res.json({ genreId: Number(req.params.genreId) });
});

module.exports = router;
