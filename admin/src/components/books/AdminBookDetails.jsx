import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AdminBookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/books/${id}`
        );
        setBook(response.data);
      } catch (error) {
        console.error("Error fetching book:", error.message);
        toast.error("Failed to load book details", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    };
    fetchBook();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await axios.delete(`http://localhost:5000/api/books/${id}`);
        toast.success("Book deleted successfully!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setTimeout(() => {
          navigate("/books");
        }, 2000);
      } catch (error) {
        console.error("Error deleting book:", error.message);
        toast.error("Failed to delete book", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    }
  };

  const handleUpdate = () => {
    navigate(`/books/edit/${id}`);
  };

  const handleBack = () => {
    navigate("/books");
  };

  if (!book) {
    return <p className="text-center text-gray-600">Loading book details...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white shadow-2xl rounded-3xl overflow-hidden relative">
        {/* Back Button (top-right corner inside card) */}
        <button
          onClick={handleBack}
          className="absolute top-4 right-4 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-xl shadow-sm transition"
        >
          ← Back
        </button>

        <div className="flex justify-center bg-gray-100 p-6">
          <img
            src={book.bookImage}
            alt={book.bookName}
            className="w-auto h-auto max-w-sm rounded-2xl shadow-md"
          />
        </div>

        <div className="p-8">
          <h1 className="text-3xl font-bold text-purple-800 mb-4">
            {book.bookName}
          </h1>
          <p className="text-lg text-gray-700 mb-4">
            <span className="font-semibold">Author:</span> {book.bookAuthor}
          </p>
          <p className="text-lg text-gray-700 mb-4">
            <span className="font-semibold">Price:</span> Rs. {book.bookPrice}
          </p>
          <p className="text-lg text-gray-700 mb-6">
            <span className="font-semibold">Available Stock:</span>{" "}
            {book.availableStock}
          </p>

          {book.extraAdding && (
            <p className="text-gray-600 italic mb-6">{book.extraAdding}</p>
          )}

          <div className="flex space-x-4">
            <button
              onClick={handleUpdate}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition duration-300"
            >
              Update Book
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition duration-300"
            >
              Delete Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminBookDetails;