const router = require("express").Router();
const User = require("../models/User");

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Nome, email e senha são obrigatórios." });
  }

  const exists = await User.findOne({ $or: [{ email }, { name }] });
  if (exists) return res.status(409).json({ message: "Usuário já cadastrado." });

  const user = await User.create({ name, email, password, favorites: [], watchLater: [] });
  res.status(201).json({
    id: user._id,
    name: user.name,
    email: user.email,
    favorites: [],
    watchLater: [],
    avatarColor: user.avatarColor,
  });
});

router.post("/login", async (req, res) => {
  const { identifier, password } = req.body;
  const user = await User.findOne({ $or: [{ email: identifier }, { name: identifier }] });
  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Credenciais inválidas." });
  }

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    favorites: user.favorites || [],
    watchLater: user.watchLater || [],
    avatarColor: user.avatarColor,
  });
});

module.exports = router;
