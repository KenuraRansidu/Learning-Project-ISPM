import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  bookImage: {
    type: String,
    required: true,
  },
  bookName: {
    type: String,
    required: true,
  },
  extraAdding: {
    type: String,
  },
  bookAuthor: {
    type: String,
    required: true,
  },
  bookPrice: {
    type: Number,
    required: true,
  },
  availableStock: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
"Web develop",
"AI",
"Information technology",
"Data engineering",
"MS office",
"Graphic design",
"Full stacks",
"Programing language",
    ]
  }
}, {
  timestamps: true
});

const Book = mongoose.model('Book', bookSchema);
export default Book;