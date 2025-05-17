import React, { useEffect, useState, useContext } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import SearchBar from '../../components/student/SearchBar';
import Footer from '../../components/student/Footer';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ViewBooks() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { currency, calculateRating } = useContext(AppContext);

  // Define your categories (should match what you have in AddBookForm)
  const categories = [
   "Web develop",
"AI",
"Information technology",
"Data engineering",
"MS office",
"Graphic design",
"Full stacks",
"Programing language",
  ];

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/books');
        setBooks(response.data);
        setFilteredBooks(response.data);
      } catch (error) {
        console.error('Error fetching books:', error.message);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    if (books.length > 0) {
      let tempBooks = [...books];
      
      // Apply category filter
      if (selectedCategory && selectedCategory !== 'All') {
        tempBooks = tempBooks.filter(book => book.category === selectedCategory);
      }
      
      // Apply search filter
      if (searchInput) {
        tempBooks = tempBooks.filter((book) =>
          book.bookName.toLowerCase().includes(searchInput.toLowerCase())
        );
      }
      
      setFilteredBooks(tempBooks);
    }
  }, [searchInput, selectedCategory, books]);

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
    <>
      <div className="relative md:px-36 px-8 pt-10 text-left min-h-screen">
        <div className="flex md:flex-row flex-col gap-6 items-center justify-between w-full">
          <div>
            <h1 className="text-4xl font-semibold text-gray-800">
              Book Collection
            </h1>
            <p className="text-gray-500">
              <span
                className="text-blue-600 cursor-pointer"
                onClick={() => navigate("/")}
              >
                Home
              </span>{" "}
              / <span>Books</span>
            </p>
          </div>
          <SearchBar 
            data={searchInput} 
            setData={setSearchInput} 
            placeholder="Search books..."
          />
        </div>

        {/* Category Filter */}
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search input display */}
        {(searchInput || selectedCategory !== 'All') && (
          <div className="inline-flex items-center gap-4 px-4 py-2 border mt-8 -mb-8 text-gray-600">
            {selectedCategory !== 'All' && (
              <p className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                Category: {selectedCategory}
              </p>
            )}
            {searchInput && (
              <>
                <p>Search: {searchInput}</p>
                <img 
                  src={assets.cross_icon} 
                  alt="search_icon" 
                  className="cursor-pointer" 
                  onClick={() => setSearchInput('')} 
                />
              </>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-16 gap-6 px-2 md:p-0">
          {filteredBooks.length > 0 ? (
            filteredBooks.map((book) => (
              <div 
                key={book._id} 
                className="border border-gray-500/30 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col h-full"
              >
                <div>
                  <img
                    src={book.bookImage}
                    alt={book.bookName}
                    className="w-full h-48 object-cover"
                  />

                  <div className="p-4 text-left">
                    <h3 className="text-base font-semibold line-clamp-2">{book.bookName}</h3>
                    <p className="text-gray-500 text-sm">{book.bookAuthor || "Unknown Author"}</p>
                    
                    {/* Display category */}
                    {book.category && (
                      <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mt-1">
                        {book.category}
                      </span>
                    )}
                    
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
                        <p className="text-gray-500 text-sm">{book.ratings?.length || 0}</p>
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
                        ? 'bg-blue-100 hover:bg-blue-200 text-blue-800' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={book.availableStock <= 0}
                  >
                    {book.availableStock > 0 ? 'Add to Cart' : 'Not Available'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-600">No books found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ViewBooks;