// File: context/CartContext.js
import { createContext, useContext, useEffect, useState, useMemo } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem('cartItems');
    return storedCart ? JSON.parse(storedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (book) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(item => item.bookId === book._id);
      const normalizedImage = book.bookImage?.startsWith('uploads/')
        ? `http://localhost:5000/${book.bookImage}`
        : book.bookImage;

      if (existingItem) {
        return prevItems.map(item =>
          item.bookId === book._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prevItems,
          {
            bookId: book._id,
            bookName: book.bookName,
            bookPrice: book.bookPrice,
            bookImage: normalizedImage,
            quantity: 1,
            availableStock: book.availableStock
          }
        ];
      }
    });
  };

  const removeFromCart = (bookId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.bookId !== bookId));
  };

  const updateQuantity = (bookId, quantity) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.bookId === bookId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  }), [cartItems]); // Only recreate if cartItems changes

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};