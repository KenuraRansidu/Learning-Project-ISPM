// File: components/OrderSuccess.js
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

function OrderSuccess() {
  const navigate = useNavigate();
  const { clearCart } = useCart();

  useEffect(() => {
    // Call clearCart only once on mount
    clearCart();
    toast.success('Order placed successfully! Cart has been cleared.');

    // Redirect to books page after 3 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000);

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [navigate]); // Remove clearCart from dependencies

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-6">Thank you for your purchase. You will be redirected to the books page shortly.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

export default OrderSuccess;