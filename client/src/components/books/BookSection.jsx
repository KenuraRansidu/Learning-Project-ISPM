import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BookSection = () => {
  const [books, setBooks] = useState([]);
  const { addToCart } = useCart();
  const { currency, calculateRating } = useContext(AppContext);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/books");
        setBooks(response.data);
      } catch (error) {
        console.error("Error fetching books:", error.message);
      }
    };

    fetchBooks();
  }, []);

  const handleAddToCart = (book) => {
    addToCart(book);
    toast.success(`${book.bookName} added to cart!`, {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <div className="py-16 md:px-40 px-8">
      <h2 className="text-3xl font-medium text-gray-800">Explore Our Books</h2>
      <p className="text-sm md:text-base text-gray-500 mt-3">
        Discover our collection of top-rated books across various genres. <br />
        From fiction to non-fiction, our books are carefully selected for
        quality.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:my-16 my-10">
        {books.slice(0, 4).map((book) => (
          <div
            key={book._id}
            className="border border-gray-500/30 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 max-w-xs mx-auto flex flex-col h-full"
          >
            <div>
              <img
                src={book.bookImage}
                alt={book.bookName}
                className="w-full h-48 object-cover"
              />

              <div className="p-4 text-left">
                <h3 className="text-base font-semibold line-clamp-2">
                  {book.bookName}
                </h3>
                <p className="text-gray-500 text-sm">
                  {book.bookAuthor || "Unknown Author"}
                </p>

                {book.ratings && (
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-sm">{calculateRating(book)}</p>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <img
                          className="w-3.5 h-3.5"
                          key={i}
                          src={
                            i < Math.floor(calculateRating(book))
                              ? assets.star
                              : assets.star_blank
                          }
                          alt=""
                        />
                      ))}
                    </div>
                    <p className="text-gray-500 text-sm">
                      {book.ratings?.length || 0}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center mt-2">
                  <p className="text-base font-semibold">
                    {currency}
                    {book.bookPrice.toFixed(2)}
                  </p>
                  {book.availableStock > 0 ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      In Stock
                    </span>
                  ) : (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-auto px-4 pb-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleAddToCart(book);
                }}
                className={`w-full text-sm font-semibold py-2 rounded transition-colors duration-200 ${
                  book.availableStock > 0
                    ? "bg-blue-100 hover:bg-blue-200 text-blue-800"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
                disabled={book.availableStock <= 0}
              >
                {book.availableStock > 0 ? "Add to Cart" : "Not Available"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <Link
        to="/book-list"
        onClick={() => scrollTo(0, 0)}
        className="text-gray-500 border border-gray-500/30 px-10 py-3 rounded"
      >
        View all books
      </Link>
    </div>
  );
};

export default BookSection;