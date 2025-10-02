const Book = require("../models/Book");
const User = require("../models/User");

const createBook = async (req, res) => {
  try {
    const { title, description, amount } = req.body;

    if (!title || !description || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, description, and amount",
      });
    }

    if (amount < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount cannot be negative",
      });
    }

    const book = await Book.create({
      title,
      description,
      amount,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: book,
    });
  } catch (error) {
    console.error("Create book error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating book",
    });
  }
};

const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    console.error("Get all books error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching books",
    });
  }
};

const getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    console.error("Get book error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching book",
    });
  }
};

const updateBook = async (req, res) => {
  try {
    const { title, description, amount } = req.body;

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    if (
      book.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this book",
      });
    }

    if (amount !== undefined && amount < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount cannot be negative",
      });
    }

    if (title) book.title = title;
    if (description) book.description = description;
    if (amount !== undefined) book.amount = amount;

    await book.save();

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    console.error("Update book error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating book",
    });
  }
};

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    if (
      book.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this book",
      });
    }

    await Book.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("Delete book error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting book",
    });
  }
};

const buyBook = async (req, res) => {
  try {
    // Find the book
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Prevent owner from buying their own book
    if (book.createdBy.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot buy your own book",
      });
    }

    if (book.amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Book is out of stock",
      });
    }

    book.amount -= 1;
    await book.save();

    const user = await User.findById(req.user._id);
    user.books_bought_amount += 1;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Book purchased successfully",
      data: {
        book: {
          _id: book._id,
          title: book.title,
          amount: book.amount,
        },
        user: {
          books_bought_amount: user.books_bought_amount,
        },
      },
    });
  } catch (error) {
    console.error("Buy book error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while purchasing book",
    });
  }
};

module.exports = {
  createBook,
  getAllBooks,
  getBook,
  updateBook,
  deleteBook,
  buyBook,
};
