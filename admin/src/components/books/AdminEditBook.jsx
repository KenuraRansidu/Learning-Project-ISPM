import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BookOpen, User, DollarSign, Package, Plus, Image as ImageIcon } from "lucide-react";

function AdminEditBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bookName: "",
    bookAuthor: "",
    bookPrice: "",
    availableStock: "",
    extraAdding: "",
    bookImage: null,
    previewImage: "",
  });

  const [errors, setErrors] = useState({
    bookName: "",
    bookAuthor: "",
    bookPrice: "",
    availableStock: "",
  });

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/books/${id}`
        );
        setFormData({
          ...response.data,
          bookImage: null,
          previewImage: response.data.bookImage,
        });
      } catch (error) {
        console.error("Error fetching book:", error.message);
        toast.error("Failed to load book data", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };
    fetchBook();
  }, [id]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      bookName: "",
      bookAuthor: "",
      bookPrice: "",
      availableStock: "",
    };

    if (!formData.bookName.trim()) {
      newErrors.bookName = "Book name is required";
      isValid = false;
    }

    if (!formData.bookAuthor.trim()) {
      newErrors.bookAuthor = "Author name is required";
      isValid = false;
    }

    if (!formData.bookPrice) {
      newErrors.bookPrice = "Price is required";
      isValid = false;
    } else if (parseFloat(formData.bookPrice) <= 0) {
      newErrors.bookPrice = "Price must be greater than 0";
      isValid = false;
    }

    if (!formData.availableStock) {
      newErrors.availableStock = "Stock quantity is required";
      isValid = false;
    } else if (parseInt(formData.availableStock) < 0) {
      newErrors.availableStock = "Stock cannot be negative";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "bookImage" && files[0]) {
      setFormData({
        ...formData,
        bookImage: files[0],
        previewImage: URL.createObjectURL(files[0]),
      });
    } else if (name === "bookAuthor") {
      const onlyLetters = value.replace(/[^A-Za-z\s]/g, '');
      setFormData({
        ...formData,
        [name]: onlyLetters,
      });
      setErrors({ ...errors, [name]: "" });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = Object.values(errors).find(error => error);
      if (firstError) {
        toast.error(firstError, {
          position: "top-right",
          autoClose: 3000,
        });
      }
      return;
    }

    try {
      const updatePayload = new FormData();
      updatePayload.append("bookName", formData.bookName);
      updatePayload.append("bookAuthor", formData.bookAuthor);
      updatePayload.append("bookPrice", parseFloat(formData.bookPrice));
      updatePayload.append("availableStock", parseInt(formData.availableStock));
      updatePayload.append("extraAdding", formData.extraAdding);

      if (formData.bookImage) {
        updatePayload.append("bookImage", formData.bookImage);
      }

      await axios.put(`http://localhost:5000/api/books/${id}`, updatePayload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Book updated successfully!", {
        position: "top-right",
        autoClose: 2000,
        onClose: () => navigate("/books"),
      });
    } catch (error) {
      console.error("Error updating book:", error.message);
      toast.error(error.response?.data?.message || "Failed to update book", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-purple-700">
        Update Book
      </h1>
      <form onSubmit={handleUpdate} className="space-y-6">
        {/* Book Name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-blue-500" /> Book Name
          </label>
          <input
            type="text"
            name="bookName"
            value={formData.bookName}
            onChange={handleChange}
            placeholder="Book Name"
            className={`w-full p-3 border ${errors.bookName ? 'border-red-500' : 'border-gray-300'} rounded-xl`}
          />
          {errors.bookName && <span className="text-red-500 text-xs mt-1">{errors.bookName}</span>}
        </div>

        {/* Book Author */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
            <User className="w-5 h-5 mr-2 text-violet-500" /> Author
          </label>
          <input
            type="text"
            name="bookAuthor"
            value={formData.bookAuthor}
            onChange={handleChange}
            placeholder="Author"
            className={`w-full p-3 border ${errors.bookAuthor ? 'border-red-500' : 'border-gray-300'} rounded-xl`}
          />
          {errors.bookAuthor && <span className="text-red-500 text-xs mt-1">{errors.bookAuthor}</span>}
        </div>

        {/* Book Price */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-pink-500" /> Price
          </label>
          <input
            type="number"
            name="bookPrice"
            value={formData.bookPrice}
            onChange={handleChange}
            placeholder="Price"
            className={`w-full p-3 border ${errors.bookPrice ? 'border-red-500' : 'border-gray-300'} rounded-xl`}
            min="0"
            onKeyDown={(e) => {
              if (!/^\d$/.test(e.key) &&
                  !['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
              }
            }}
          />
          {errors.bookPrice && <span className="text-red-500 text-xs mt-1">{errors.bookPrice}</span>}
        </div>

        {/* Available Stock */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Package className="w-5 h-5 mr-2 text-emerald-500" /> Available Stock
          </label>
          <input
            type="number"
            name="availableStock"
            value={formData.availableStock}
            onChange={handleChange}
            placeholder="Available Stock"
            className={`w-full p-3 border ${errors.availableStock ? 'border-red-500' : 'border-gray-300'} rounded-xl`}
            min="0"
            onKeyDown={(e) => {
              if (!/^\d$/.test(e.key) &&
                  !['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
              }
            }}
          />
          {errors.availableStock && <span className="text-red-500 text-xs mt-1">{errors.availableStock}</span>}
        </div>

        {/* Extra Adding */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-indigo-500" /> Description (optional)
          </label>
          <input
            type="text"
            name="extraAdding"
            value={formData.extraAdding}
            onChange={handleChange}
            placeholder="Description (optional)"
            className="w-full p-3 border border-gray-300 rounded-xl"
          />
        </div>

        {/* Image Preview */}
        {formData.previewImage && (
          <div className="mb-4">
            <img
              src={formData.previewImage}
              alt="Book"
              className="w-48 h-60 object-contain rounded-xl border mb-2"
            />
            <p className="text-sm text-gray-500">Current Image</p>
          </div>
        )}

        {/* Upload New Image */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-purple-500" /> New Image (optional)
          </label>
          <input
            type="file"
            name="bookImage"
            accept="image/*"
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl"
        >
          Update Book
        </button>
      </form>
    </div>
  );
}

export default AdminEditBook;