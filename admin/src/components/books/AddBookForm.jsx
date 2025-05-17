import { useState } from 'react';
import { BookOpen, ArrowLeft, Plus, DollarSign, Package, Image, User, Bookmark } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AddBookForm() {
  const navigate = useNavigate();

  // Hardcoded categories
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

  const [formData, setState] = useState({
    bookImage: '',
    bookName: '',
    extraAdding: '',
    bookAuthor: '',
    bookPrice: '',
    availableStock: '',
    category: '' // Add category field
  });

  const [errors, setErrors] = useState({
    bookImage: '',
    bookName: '',
    bookAuthor: '',
    bookPrice: '',
    availableStock: '',
    category: '' // Add category validation
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      bookImage: '',
      bookName: '',
      bookAuthor: '',
      bookPrice: '',
      availableStock: '',
      category: ''
    };

    // Validate book image
    if (!formData.bookImage) {
      newErrors.bookImage = 'Book image is required';
      isValid = false;
    }

    // Validate book name
    if (!formData.bookName.trim()) {
      newErrors.bookName = 'Book name is required';
      isValid = false;
    }

    // Validate book author
    if (!formData.bookAuthor.trim()) {
      newErrors.bookAuthor = 'Book author is required';
      isValid = false;
    }

    // Validate book price
    if (!formData.bookPrice) {
      newErrors.bookPrice = 'Book price is required';
      isValid = false;
    } else if (parseFloat(formData.bookPrice) <= 0) {
      newErrors.bookPrice = 'Book price must be greater than 0';
      isValid = false;
    }

    // Validate available stock
    if (!formData.availableStock) {
      newErrors.availableStock = 'Available stock is required';
      isValid = false;
    } else if (parseInt(formData.availableStock) < 0) {
      newErrors.availableStock = 'Available stock cannot be negative';
      isValid = false;
    }

    // Validate category
    if (!formData.category) {
      newErrors.category = 'Category is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "bookImage") {
      setState({ ...formData, bookImage: files[0] });
      setErrors({ ...errors, bookImage: '' });
    } else if (name === "bookAuthor") {
      const onlyLetters = value.replace(/[^A-Za-z\s]/g, '');
      setState({ ...formData, [name]: onlyLetters });
      setErrors({ ...errors, bookAuthor: '' });
    } else {
      setState({ ...formData, [name]: value });
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const firstError = Object.values(errors).find(error => error);
      if (firstError) {
        toast.error(firstError, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
      return;
    }

    try {
      const formPayload = new FormData();
      formPayload.append("bookImage", formData.bookImage);
      formPayload.append("bookName", formData.bookName);
      formPayload.append("extraAdding", formData.extraAdding);
      formPayload.append("bookAuthor", formData.bookAuthor);
      formPayload.append("bookPrice", parseFloat(formData.bookPrice));
      formPayload.append("availableStock", parseInt(formData.availableStock));
      formPayload.append("category", formData.category); // Add category to form data

      await axios.post("http://localhost:5000/api/books", formPayload);

      toast.success('Book added successfully!', {
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

      setState({
        bookImage: "",
        bookName: "",
        extraAdding: "",
        bookAuthor: "",
        bookPrice: "",
        availableStock: "",
        category: "" // Reset category
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.response?.data?.message || "Failed to add book", {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-purple-200 p-10">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-8 tracking-wide">Add a New Book</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Book Image */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Image className="w-5 h-5 mr-2 text-purple-500" /> Book Image
            </label>
            <input
              type="file"
              name="bookImage"
              onChange={handleChange}
              accept="image/*"
              className="px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-white"
            />
            {errors.bookImage && <span className="text-red-500 text-xs mt-1">{errors.bookImage}</span>}
          </div>

          {/* Book Name */}
          <FormInput
            label="Book Name"
            name="bookName"
            value={formData.bookName}
            onChange={handleChange}
            placeholder="Enter book title"
            icon={<BookOpen className="w-5 h-5 mr-2 text-blue-500" />}
            error={errors.bookName}
          />

          {/* Category Dropdown */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Bookmark className="w-5 h-5 mr-2 text-indigo-500" /> Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`px-4 py-3 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-white`}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && <span className="text-red-500 text-xs mt-1">{errors.category}</span>}
          </div>

          {/* Extra Adding */}
          <FormInput
            label="Extra Adding"
            name="extraAdding"
            value={formData.extraAdding}
            onChange={handleChange}
            placeholder="Additional info (optional)"
            icon={<Plus className="w-5 h-5 mr-2 text-indigo-500" />}
          />

          {/* Book Author (letters only) */}
          <FormInput
            label="Book Author"
            name="bookAuthor"
            value={formData.bookAuthor}
            onChange={handleChange}
            placeholder="Author's name"
            icon={<User className="w-5 h-5 mr-2 text-violet-500" />}
            error={errors.bookAuthor}
          />

          {/* Book Price (positive number only) */}
          <FormInput
            label="Book Price"
            name="bookPrice"
            value={formData.bookPrice}
            onChange={handleChange}
            placeholder="0.00"
            type="number"
            icon={<DollarSign className="w-5 h-5 mr-2 text-pink-500" />}
            min="0"
            error={errors.bookPrice}
            onKeyDown={(e) => {
              if (!/^\d$/.test(e.key) &&
                  !['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
              }
            }}
          />

          {/* Available Stock (positive integer only) */}
          <FormInput
            label="Available Stock"
            name="availableStock"
            value={formData.availableStock}
            onChange={handleChange}
            placeholder="Stock count"
            type="number"
            icon={<Package className="w-5 h-5 mr-2 text-emerald-500" />}
            min="0"
            error={errors.availableStock}
            onKeyDown={(e) => {
              if (!/^\d$/.test(e.key) &&
                  !['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
              }
            }}
          />

          {/* Buttons */}
          <div className="col-span-1 md:col-span-2 flex justify-between items-center mt-4">
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-green-400 to-emerald-600 text-white font-semibold rounded-xl shadow-md hover:scale-105 transition transform"
            >
              Add Book
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl shadow hover:scale-105 flex items-center transition"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Form Input Component (keep this the same as before)
import PropTypes from 'prop-types';

function FormInput({ label, icon, name, value, onChange, placeholder, type = "text", min, onKeyDown, accept, error }) {
  if (name === "bookPrice") {
    return (
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
          {icon} {label}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rs.</span>
          <input
            type={type}
            name={name}
            value={type === "file" ? undefined : value}
            onChange={onChange}
            placeholder={placeholder}
            min={min}
            onKeyDown={onKeyDown}
            accept={accept}
            className={`pl-10 pr-4 py-3 w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-white`}
          />
        </div>
        {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
        {icon} {label}
      </label>
      <input
        type={type}
        name={name}
        value={type === "file" ? undefined : value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        onKeyDown={onKeyDown}
        accept={accept}
        className={`px-4 py-3 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-white`}
      />
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  );
}

FormInput.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.node,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onKeyDown: PropTypes.func,
  accept: PropTypes.string,
  error: PropTypes.string
};