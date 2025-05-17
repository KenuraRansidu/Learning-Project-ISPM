import Book from '../models/Book.js'; // ES6 import
import { v2 as cloudinary } from "cloudinary";

// Create a new book
export const createBook = async (req, res) => {
  try {
    const { bookName, extraAdding, bookAuthor, bookPrice, availableStock, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Book Thumbnail Not Attached" });
    }
    const imageUpload = await cloudinary.uploader.upload(req.file.path);

    const book = new Book({
      bookImage: imageUpload.secure_url,
      bookName,
      extraAdding,
      bookAuthor,
      bookPrice,
      availableStock,
      category
    });

    await book.save();
    res.status(201).json({ message: "Book added successfully", book });
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).json({ message: "Failed to add book", error: error.message });
  }
};

// Get all books
export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Failed to fetch books', error: error.message });
  }
};

// Get book by ID
export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error('Error fetching book by ID:', error);
    res.status(500).json({ message: 'Failed to fetch book', error: error.message });
  }
};

// Delete a book by ID
export const deleteBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBook = await Book.findByIdAndDelete(id);

    if (!deletedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Failed to delete book', error: error.message });
  }
};

// Update a book by ID
export const updateBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      bookName: req.body.bookName,
      bookAuthor: req.body.bookAuthor,
      bookPrice: parseFloat(req.body.bookPrice),
      availableStock: parseInt(req.body.availableStock),
      extraAdding: req.body.extraAdding,
    };

    // Handle image upload if a new file is provided
    if (req.file) {
      const imageUpload = await cloudinary.uploader.upload(req.file.path, {
        folder: "books", 
      });
      updateData.bookImage = imageUpload.secure_url; 
    }

    // Update the book in the database
    const updatedBook = await Book.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json(updatedBook);
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ message: "Failed to update book", error: error.message });
  }
};