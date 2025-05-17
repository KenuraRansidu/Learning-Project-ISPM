import React, { useContext } from "react";
import { FaShoppingCart } from "react-icons/fa"; // Import the cart icon
import { Link } from "react-router-dom";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";
import axios from "axios";

const Navbar = () => {
  const isCourseListPage = location.pathname.includes("/course-list");
  const { navigate, isEducator, backendUrl, getToken } =
    useContext(AppContext);
  const { openSignIn } = useClerk();
  const { user } = useUser();

  const becomeEducator = async () => {
    try {
      if (isEducator) {
        navigate("/educator");
        return;
      }
      const token = await getToken();
      const { data } = await axios.get(
        backendUrl + "/api/educator/request-role",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div
      className={`flex item-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gary-500 py-4 ${
        isCourseListPage ? "bg-white" : "bg-cyan-100/70"
      }`}
    >
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="Logo"
        className="w-28 lg:w-32 cursor-pointer"
      />
      <div className="hidden md:flex items-center gap-5 text-gray-500">
        <div className="flex items-center gap-5">
          {user && (
            <>
              {/* <button onClick={becomeEducator}>
                {isEducator ? "Educator DashBoard" : "Become Educator"}{" "}
              </button> */}
               <Link to="/my-enrollments">My Enrollments</Link>
              {/* Show cart icon only for normal users */}
              {!isEducator && (
                <>
                  | <Link to="/cart" className="flex items-center gap-1">
                      <FaShoppingCart className="w-5 h-5" />
                      <span>Cart</span>
                    </Link>
                </>
              )}
            </>
          )}
        </div>
        {user ? (
          <UserButton />
        ) : (
          <button
            onClick={() => openSignIn()}
            className="bg-blue-600 text-white px-5 py-2 rounded-full"
          >
            Create Account
          </button>
        )}
      </div>

      {/* For Phone Screen*/}
      <div className="md:hidden flex item-center gap-2 sm:gap-5 text-gray-500">
        <div className="flex items-center gap-1 sm:gap-2 max-sm:text-xs">
          {user && (
            <>
              <button onClick={becomeEducator}>
                {isEducator ? "Educator" : "Become Educator"}{" "}
              </button>
              <Link to="/my-enrollments">Enrollments</Link>
              {/* Show cart icon only for normal users in mobile view */}
              {!isEducator && (
                <Link to="/cart" className="flex items-center">
                  <FaShoppingCart className="w-5 h-5" />
                </Link>
              )}
            </>
          )}
        </div>
        {user ? (
          <UserButton />
        ) : (
          <button onClick={() => openSignIn()}>
            <img src={assets.user_icon} alt="" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;