// File: components/Cart.js
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useContext, useState } from 'react';
import { toast } from 'react-toastify';

function Cart() {
  // Destructure clearCart along with other functions
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { currency } = useContext(AppContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const total = cartItems.reduce((acc, item) => acc + item.bookPrice * item.quantity, 0);

  const handleAddMoreItems = () => {
    navigate('/book-list');
  };

  const handleQuantityChange = (bookId, newQuantity, availableStock) => {
    if (newQuantity > availableStock) {
      setError(`Quantity cannot exceed available stock (${availableStock})`);
      return;
    }
    setError(null);
    updateQuantity(bookId, newQuantity);
  };

  const handleProceedToCheckout = async () => {
    try {
      const stockExceededItem = cartItems.find(item => item.quantity > item.availableStock);
      if (stockExceededItem) {
        setError(`"${stockExceededItem.bookName}" quantity (${stockExceededItem.quantity}) exceeds available stock (${stockExceededItem.availableStock})`);
        return;
      }

      if (cartItems.length === 0) {
        setError('Your cart is empty');
        return;
      }

      const userData = JSON.parse(localStorage.getItem('usersData'));
      if (!userData || !userData._id) {
        setError('User information not found. Please log in again.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData._id,
          userName: userData.name,
          items: cartItems.map(item => ({
            bookId: item.bookId,
            bookName: item.bookName,
            quantity: item.quantity,
            price: item.bookPrice
          })),
          totalAmount: total
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      if (data.success && data.session_url) {
        window.location.replace(data.session_url);
      }
    } catch (error) {
      toast.error(error.message);
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Your Cart</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600 mb-6">Your cart is empty</p>
            <button
              onClick={() => navigate('/books')}
              className="text-gray-500 border border-gray-500/30 px-10 py-3 rounded hover:bg-gray-100 transition-colors"
            >
              Browse Books
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div 
                key={item.bookId} 
                className="border border-gray-500/30 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-gray-800">{item.bookName}</h2>
                  <p className="text-gray-500 text-sm">{item.bookAuthor || "Unknown Author"}</p>
                  <div className="flex items-center mt-2 gap-2">
                    <label className="text-gray-500 text-sm">Qty:</label>
                    <input
                      type="number"
                      min="1"
                      max={item.availableStock}
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(
                        item.bookId, 
                        parseInt(e.target.value), 
                        item.availableStock
                      )}
                      className="w-16 p-1 border border-gray-300 rounded text-center text-sm"
                    />
                    {item.quantity > item.availableStock && (
                      <span className="text-red-500 text-xs">
                        Max: {item.availableStock}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <p className="text-base font-semibold">
                    {currency}
                    {(item.bookPrice * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.bookId)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div className="border-t border-gray-300 pt-6 mt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-3">
                  <button
                    onClick={clearCart} // This is line ~160, now using the destructured clearCart
                    className="text-gray-500 border border-gray-500/30 px-6 py-2 rounded text-sm hover:bg-gray-100"
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={handleAddMoreItems}
                    className="text-gray-500 border border-gray-500/30 px-6 py-2 rounded text-sm hover:bg-gray-100"
                  >
                    Add More Items
                  </button>
                </div>
                
                <div className="flex flex-col items-end">
                  <p className="text-lg font-semibold text-gray-800">
                    Total: {currency}{total.toFixed(2)}
                  </p>
                  <button
                    onClick={handleProceedToCheckout}
                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded text-sm font-semibold"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;