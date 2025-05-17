import React from 'react';
import { 
  FaTachometerAlt,  // Dashboard
  FaPlus,           // Add Course
  FaBook,           // My Course
  FaUserGraduate,   // Students Enrolled
  FaBookOpen,       // Books
  FaBookMedical,    // Add Books
  FaList, // Cert Reqs
} from 'react-icons/fa';

const Sidebar = () => {
    return (
        <aside className="w-64 bg-white shadow-lg rounded-lg p-6 bg-opacity-60 backdrop-blur-lg border border-gray-200">
            {/* Sidebar Items */}
            <ul className="space-y-6">
                <li className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition transform hover:scale-105">
                    <FaTachometerAlt className="text-gray-700" />
                    <a href="/dashboard" className="text-gray-800 font-semibold text-base">Dashboard</a>
                </li>
                <li className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition transform hover:scale-105">
                    <FaPlus className="text-gray-700" />
                    <a href="/add-course" className="text-gray-800 font-semibold text-base">Add Course</a>
                </li>
                <li className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition transform hover:scale-105">
                    <FaBook className="text-gray-700" />
                    <a href="/my-course" className="text-gray-800 font-semibold text-base">My Course</a>
                </li>
                <li className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition transform hover:scale-105">
                    <FaUserGraduate className="text-gray-700" />
                    <a href="/students-enrolled" className="text-gray-800 font-semibold text-base">Students Enrolled</a>
                </li>
                <li className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition transform hover:scale-105">
                    <FaBookOpen className="text-gray-700" />
                    <a href="/books" className="text-gray-800 font-semibold text-base">Books</a>
                </li>
                <li className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition transform hover:scale-105">
                    <FaBookMedical className="text-gray-700" />
                    <a href="/addbooks" className="text-gray-800 font-semibold text-base">Add Books</a>
                </li>
                <li className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition transform hover:scale-105">
                    <FaList className="text-gray-700" />
                    <a href="/certificate-requests" className="text-gray-800 font-semibold text-base">Certification Requests</a>
                </li>
            </ul>
        </aside>
    );
};

export default Sidebar;