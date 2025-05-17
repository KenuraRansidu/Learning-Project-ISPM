import  { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Routes, Route } from 'react-router-dom'
import Orders from './pages/Orders'
import AdminHomePage from './pages/AdminHomePage'
import Login from './components/Login'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddBookForm from './components/books/AddBookForm'
import AdminViewBooks from './components/books/AdminViewBooks'
import AdminBookDetails from './components/books/AdminBookDetails'
import AdminEditBook from './components/books/AdminEditBook'
import EduactorDashboard from './pages/EduactorDashboard'
import AddCourse from './pages/AddCourse'
import MyCourse from './pages/MyCourse'
import StudentsEnrolled from './pages/StudentsEnrolled'
import CertificateRequests from './pages/CertificateRequests'; 

export const backendUrl = import.meta.env.VITE_BACKEND_URL
export const currency = 'LKR'

const App = () => {

  const [token, setToken] = useState(localStorage.getItem('token')?localStorage.getItem('token'):'');

  useEffect(()=>{
    localStorage.setItem('token',token)
  },[token])

  return (
    <div className='bg-gray-50 min-h-screen'>
      <ToastContainer />
      {token === ""
        ? <Login setToken={setToken} />
        : <>
          <Navbar setToken={setToken} />
          <hr />
          <div className='flex w-full'>
            <Sidebar />
            <div className='w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base'>
              <Routes>
                <Route path='/' element={<EduactorDashboard token={token} />} />
                <Route path='/orders' element={<Orders token={token} />} />
                <Route path='/books' element={<AdminViewBooks token={token} />} />
                <Route path='/addbooks' element={<AddBookForm token={token} />} />
                <Route path='/books/:id' element={<AdminBookDetails token={token} />} />
                <Route path='/books/edit/:id' element={<AdminEditBook token={token} />} />
                <Route path='/dashboard' element={<EduactorDashboard token={token} />} />
                <Route path='/add-course' element={<AddCourse token={token} />} />
                <Route path='/my-course' element={<MyCourse token={token} />} />
                <Route path='/students-enrolled' element={<StudentsEnrolled token={token} />} />
                <Route path='/certificate-requests' element={<CertificateRequests token={token} />} />
              </Routes>
            </div>
          </div>
        </>
      }
    </div>
  )
}

export default App