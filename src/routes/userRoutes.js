const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getMe,
} = require("../controllers/userController");
const { protect, restrictTo } = require("../middleware/auth");

// Get current user profile
router.get("/me", protect, getMe);

// Get all users (admin only)
router.get("/", protect, getAllUsers);

// Get single user (admin only)
router.get("/:id", protect, getUser);

// Update user (owner or admin)
router.put("/:id", protect, updateUser);

// Delete user (admin only)
router.delete("/:id", protect, deleteUser);

module.exports = router;
