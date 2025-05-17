import { Router } from 'express';
import {
  getAllBooks,
  getBookById,
  deleteBookById,
  createBook,
  updateBookById
} from '../controllers/bookController.js';
import upload from "../configs/multer.js";

const router = Router();

// Route to create a book
router.post('/', upload.single('bookImage'), createBook);

// Route to get all books
router.get('/', getAllBooks);

// Route to get a single book by ID
router.get('/:id', getBookById);

// Route to delete a book
router.delete('/:id', deleteBookById);

// Route to update a book
router.put('/:id', upload.single('bookImage'), updateBookById);

export default router;
