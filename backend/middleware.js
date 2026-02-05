const { verifyToken } = require("./auth");

function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.sendStatus(401);

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.sendStatus(401);
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== "admin") return res.sendStatus(403);
  next();
}

module.exports = { auth, adminOnly };
