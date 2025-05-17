import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CourseCard from "./CourseCard";
import axios from "axios";

const TopRatedCoursesSection = () => {
  const [topRatedCourses, setTopRatedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopRatedCourses = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('http://localhost:5000/api/educator/dashboard');
        
        if (data.success && data.dashboardData.bestCourses.length > 0) {
          setTopRatedCourses(data.dashboardData.bestCourses);
        }
      } catch (error) {
        console.error("Error fetching top rated courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopRatedCourses();
  }, []);

  if (loading) {
    return (
      <div className="py-16 md:px-40 px-8 text-center">
        <p>Loading top courses...</p>
      </div>
    );
  }

  return (
    <div className="py-16 md:px-40 px-8">
      <h2 className="text-3xl font-medium text-gray-800 text-center">
        Top Rated Courses
      </h2>
      <p className="text-sm md:text-base text-gray-500 mt-3 text-center">
        Our highest-rated courses loved by students. These courses have excellent 
        ratings and engagement from our community.
      </p>

      {topRatedCourses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-0 md:my-16 my-10">
            {topRatedCourses.slice(0, 4).map((course, index) => (
              <CourseCard key={index} course={course} />
            ))}
          </div>
          {/* <div className="text-center">
            <Link
              to={"/course-list"}
              onClick={() => window.scrollTo(0, 0)}
              className="inline-block text-gray-500 border border-gray-500/30 px-10 py-3 rounded"
            >
              Show all top courses
            </Link>
          </div> */}
        </>
      ) : (
        <div className="my-16 text-gray-500 text-center">
          No top rated courses available yet. Check back soon!
        </div>
      )}
    </div>
  );
};

export default TopRatedCoursesSection;