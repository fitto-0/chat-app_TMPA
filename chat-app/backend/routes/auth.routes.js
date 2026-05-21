const express = require("express");
const router = express.Router();
const {
  register,
  login,
  createAgent,
  getAgents,
  deleteAgent,
} = require("../controllers/auth.controller");
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");

router.post("/login", login);

// Admin routes
router.post("/agents", auth, admin, createAgent);
router.get("/agents", auth, admin, getAgents);
router.delete("/agents/:id", auth, admin, deleteAgent);

module.exports = router;
