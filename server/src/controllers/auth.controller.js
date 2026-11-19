const authService = require("../services/auth.service");

async function register(req, res) {
  res.status(201).json(await authService.register(req.body));
}

async function login(req, res) {
  res.json(await authService.login(req.body));
}

async function me(req, res) {
  res.json(await authService.getProfile(req.user.id));
}

module.exports = { register, login, me };
