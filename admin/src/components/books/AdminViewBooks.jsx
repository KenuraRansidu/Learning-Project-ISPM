import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function AdminDashboard() {
  // State management
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState({
    books: true,
    orders: true,
    pdf: false
  });
  const navigate = useNavigate();
  const pdfRef = useRef();

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, ordersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/books'),
          axios.get(`http://localhost:5000/api/orders?filter=${filter}`)
        ]);
        setBooks(booksRes.data);
        setOrders(ordersRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading({ books: false, orders: false, pdf: false });
      }
    };
    fetchData();
  }, [filter]);

  // Stock status helpers
  const getStockStatusClass = (stock) => {
    if (stock <= 20) return 'bg-red-100 text-red-800';
    if (stock <= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStockStatusText = (stock) => {
    if (stock <= 20) return 'Critical';
    if (stock <= 50) return 'Low';
    return 'Good';
  };

  // PDF generation
  const generatePDF = async () => {
    try {
      setLoading(prev => ({ ...prev, pdf: true }));
      
      const element = pdfRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        scrollY: -window.scrollY,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('dashboard_report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(prev => ({ ...prev, pdf: false }));
    }
  };

  // Chart data preparation
  const prepareChartData = () => {
    const dailyRevenue = {};
    const now = new Date();
    
    orders.forEach(order => {
      const orderDate = new Date(order.orderDate).toLocaleDateString();
      if (filter === 'daily') {
        if (new Date(order.orderDate).toDateString() === now.toDateString()) {
          dailyRevenue[orderDate] = (dailyRevenue[orderDate] || 0) + order.totalAmount;
        }
      } else if (filter === 'weekly') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (new Date(order.orderDate) >= oneWeekAgo) {
          dailyRevenue[orderDate] = (dailyRevenue[orderDate] || 0) + order.totalAmount;
        }
      } else {
        dailyRevenue[orderDate] = (dailyRevenue[orderDate] || 0) + order.totalAmount;
      }
    });

    const labels = Object.keys(dailyRevenue).sort();
    const data = labels.map(date => dailyRevenue[date]);

    return {
      labels,
      datasets: [{
        label: 'Daily Revenue',
        data,
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      }],
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: filter === 'daily' ? 'Today\'s Revenue' : 
              filter === 'weekly' ? 'Weekly Revenue' : 'All Revenue',
      },
    },
  };

  // Calculate totals
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10" ref={pdfRef}>
      {/* Header with PDF button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <button
          onClick={generatePDF}
          disabled={loading.pdf}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center disabled:opacity-50"
        >
          {loading.pdf ? (
            'Generating PDF...'
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Export as PDF
            </>
          )}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Books</h3>
          <p className="text-2xl font-bold">{books.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Orders</h3>
          <p className="text-2xl font-bold">{totalOrders}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Revenue</h3>
          <p className="text-2xl font-bold">Rs. {totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          All Orders
        </button>
        <button
          onClick={() => setFilter('daily')}
          className={`px-4 py-2 rounded ${filter === 'daily' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Today
        </button>
        <button
          onClick={() => setFilter('weekly')}
          className={`px-4 py-2 rounded ${filter === 'weekly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          This Week
        </button>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="h-64">
          <Bar data={prepareChartData()} options={chartOptions} />
        </div>
      </div>

      {/* Books Inventory */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Books Inventory</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cover</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading.books ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center">Loading books...</td>
              </tr>
            ) : books.length > 0 ? (
              books.map((book) => (
                <tr 
                  key={book._id} 
                  onClick={() => navigate(`/books/${book._id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img src={book.bookImage} alt={book.bookName} className="h-12 w-12 object-cover rounded" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{book.bookName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{book.bookAuthor}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Rs. {book.bookPrice}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockStatusClass(book.availableStock)}`}>
                      {getStockStatusText(book.availableStock)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {book.availableStock}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  No books found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Recent Orders */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading.orders ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">Loading orders...</td>
              </tr>
            ) : orders.length > 0 ? (
              orders.slice(0, 5).map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order._id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.userName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.items.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    Rs. {order.totalAmount.toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;