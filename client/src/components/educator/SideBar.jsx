import React, { useContext } from "react";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import { NavLink } from "react-router-dom";

const SideBar = () => {
  const { isEducator } = useContext(AppContext);

  const menuItems = [
    {
      name: "Dashboard",
      icon: assets.home_icon,
      link: "/educator",
    },
    {
      name: "Add Courses",
      icon: assets.add_icon,
      link: "/educator/add-course",
    },
    {
      name: "My Courses",
      icon: assets.my_course_icon,
      link: "/educator/my-course",
    },
    {
      name: "Students Enrolled",
      icon: assets.person_tick_icon,
      link: "/educator/students-enrolled",
    },
  ];

  return (
    isEducator && (
      <div className="md:w-64 w-16 border-r min-h-screen text-base border-gray-500 py-2 flex flex-col">
        {menuItems.map((item) => (
          <NavLink
            to={item.link}
            key={item.name}
            end={item.link === "/educator"}
            className={({ isActive }) =>
              `flex items-center md:flex-row flex-col md:justify-start justify-center py-3.5 md:px-10 gap-3 ${
                isActive
                  ? "bg-indigo-50 border-r-[6px] border-indigo-500/90"
                  : "hover:bg-gray-100/90 border-r-[6px] border-white hover:border-gray-100/90"
              }`
            }
          >
            <img src={item.icon} alt="" className="w-6 h-6" />
            <p className="md:block hidden text-center">{item.name}</p>
          </NavLink>
        ))}
      </div>
    )
  );
};

export default SideBar;
