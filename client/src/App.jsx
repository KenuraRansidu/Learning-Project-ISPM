import React from "react";
import { Routes, Route, useMatch } from "react-router-dom";
import Home from "./pages/student/Home";
import CoursesList from "./pages/student/CoursesList";
import CourseDetails from "./pages/student/CourseDetails";
import Player from "./pages/student/Player";
import Loading from "./components/student/Loading";
import Educator from "./pages/educator/Educator";
import DashBoard from "./pages/educator/DashBoard";
import AddCourse from "./pages/educator/AddCourse";
import MyCourse from "./pages/educator/MyCourse";
import StudentsEnrolled from "./pages/educator/StudentsEnrolled";
import Navbar from "./components/student/Navbar";
import MyEnrollment from "./pages/student/MyEnrollment";
import "quill/dist/quill.snow.css";
import { ToastContainer } from 'react-toastify';
import ViewBook from "./components/books/ViewBooks";
// import AdminViewBooks from "./components/books/AdminViewBooks";
// import AdminBookDetails from "./components/books/AdminBookDetails";
// import AdminEditBook from "./components/books/AdminEditBook";
import Cart from "./components/cart/Cart";
import OrderSuccess from "./components/cart/OrderSuccess";
import CertificateRequestForm from "./pages/student/certificateRequestForm"


const App = () => {
  const isEducatorRoute = useMatch("/educator/*");

  return (
    <div className="text-defult min-h-screen bg-white">
      <ToastContainer />
      {!isEducatorRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/certificateRequestForm" element={<CertificateRequestForm />} />
        <Route path="/course-list" element={<CoursesList />} />
        <Route path="/course-list/:input" element={<CoursesList />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/my-enrollments" element={<MyEnrollment />} />
        <Route path="/player/:courseId" element={<Player />} />
        <Route path="/loading/:path" element={<Loading />} />
        <Route path="/educator" element={<Educator />}>
          <Route path="/educator" element={<DashBoard />} />
          <Route path="add-course" element={<AddCourse />} />
          <Route path="my-course" element={<MyCourse />} />
          <Route path="students-enrolled" element={<StudentsEnrolled />} />
        </Route>
        {/* book Pages */}
        <Route path="/book-list" element={<ViewBook />} />
        <Route path="cart" element={<Cart />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        {/* admin book Pages */}
        {/* <Route path="/admin/books" element={<AdminViewBooks />} />
        <Route path="/admin/books/:id" element={<AdminBookDetails />} />
        <Route path="/admin/books/edit/:id" element={<AdminEditBook />} /> */}
      </Routes>
    </div>
  );
};

export default App;
