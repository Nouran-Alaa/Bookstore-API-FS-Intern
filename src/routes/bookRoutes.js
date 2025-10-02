const express = require("express");
const router = express.Router();
const {
  createBook,
  getAllBooks,
  getBook,
  updateBook,
  deleteBook,
  buyBook,
} = require("../controllers/bookController");
const { protect } = require("../middleware/auth");

router.get("/", getAllBooks);

router.post("/", protect, createBook);

router.get("/:id", getBook);

router.put("/:id", protect, updateBook);

router.delete("/:id", protect, deleteBook);

router.post("/:id/buy", protect, buyBook);

module.exports = router;
