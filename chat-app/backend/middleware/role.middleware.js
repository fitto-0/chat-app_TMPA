module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = (req.user?.role || "").toString().toLowerCase();
    const allowed = allowedRoles.map((r) => r.toString().toLowerCase());
    if (!allowed.includes(userRole)) {
      return res.status(403).json({ message: "Accès refusé" });
    }
    next();
  };
};
