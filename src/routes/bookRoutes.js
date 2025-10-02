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

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: List of all books
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 */
router.get("/", getAllBooks);

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - amount
 *             properties:
 *               title:
 *                 type: string
 *                 example: Node.js Mastery
 *               description:
 *                 type: string
 *                 example: Complete guide to Node.js
 *               amount:
 *                 type: number
 *                 example: 50
 *     responses:
 *       201:
 *         description: Book created successfully
 *       401:
 *         description: Not authorized
 */
router.post("/", protect, createBook);

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get single book
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book details
 *       404:
 *         description: Book not found
 */
router.get("/:id", getBook);

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Update a book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       403:
 *         description: Not authorized to update this book
 */
router.put("/:id", protect, updateBook);

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       403:
 *         description: Not authorized to delete this book
 */
router.delete("/:id", protect, deleteBook);

/**
 * @swagger
 * /books/{id}/buy:
 *   post:
 *     summary: Buy a book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book purchased successfully
 *       400:
 *         description: Cannot buy own book or out of stock
 */
router.post("/:id/buy", protect, buyBook);

module.exports = router;
