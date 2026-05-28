module.exports = (req, res, next) => {
  if (!["admin", "superAdmin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Accès refusé" });
  }
  next();
};
