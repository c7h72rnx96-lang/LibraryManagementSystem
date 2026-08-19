export const requireAdmin = (req, res, next) => {
  // Check if the logged-in user is an admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  next();
};
