import React, { use, useEffect, useState } from "react";
import { useContext } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import Footer from "../../components/student/Footer";
import YouTube from "react-youtube";
import axios from "axios";
import { toast } from "react-toastify";

const CourseDetails = () => {
  const { id } = useParams();

  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [playerData, setPlayerData] = useState(null);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const {
    allCourses,
    calculateRating,
    calculateNoOfLectures,
    calculateCourseDuration,
    calculateChapterTime,
    currency,
    backendUrl,
    userData,
    getToken,
  } = useContext(AppContext);

  const fetchRecommendedCourses = async () => {
  try {
    setLoadingRecommendations(true);
    
    // Get enrolled courses from localStorage
    const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '{}');
    const categories = Object.values(enrolledCourses).map(course => course.category);
    
    // If user has enrolled courses, filter by those categories
    if (categories.length > 0) {
      const { data } = await axios.get(`${backendUrl}/api/course/all`);
      const filtered = data.courses.filter(course => 
        categories.includes(course.category) && 
        course._id !== id && // Exclude current course
        !enrolledCourses[course._id] // Exclude already enrolled courses
      );
      setRecommendedCourses(filtered.slice(0, 4)); // Show top 4 matches
    } 
    // If no enrolled courses, show random courses
    else {
      const { data } = await axios.get(`${backendUrl}/api/course/all`);
      const shuffled = [...data.courses].sort(() => 0.5 - Math.random());
      setRecommendedCourses(shuffled.slice(0, 4));
    }
  } catch (error) {
    toast.error("Failed to load recommendations");
    console.error(error);
  } finally {
    setLoadingRecommendations(false);
  }
};

  const fetchCourseData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/course/" + id);
      if (data.success) {
        setCourseData(data.courseData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

const enrollCourse = async () => {
  try {
    if (!userData) {
      return toast.warn("Login to enroll ");
    }
    if (isAlreadyEnrolled) {
      return toast.warn("Already Enrolled");
    }
    const token = await getToken();
    const { data } = await axios.post(
      backendUrl + "/api/user/purchase",
      { courseId: courseData._id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (data.success) {
      // Store enrolled course in localStorage
      const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses')) || {};
      enrolledCourses[courseData._id] = {
        id: courseData._id,
        category: courseData.category,
        enrolledAt: new Date().toISOString()
      };
      localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
      
      const { session_url } = data;
      window.location.replace(session_url);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.message);
  }
};

useEffect(() => {
  if (courseData) {
    fetchRecommendedCourses();
  }
}, [courseData]);

  useEffect(() => {
    if (userData && courseData) {
      setIsAlreadyEnrolled(userData.enrolledCourses.includes(courseData._id));
    }
  }, [userData, courseData]);

  useEffect(() => {
    fetchCourseData();
  }, []);

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return courseData ? (
    <>
      <div className="flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-30 pt-20 text-left">
        <div className="absolute top-0 left-0 w-full h-section-height -z-1 bg-gradient-to-b from-cyan-100/70"></div>

        {/** left column  */}
        <div className="max-w-xl z-10 text-gray-500">
          <h1 className="md:text-course-deatails-heading-large text-course-deatails-heading-small font-semibold text-gray-800">
            {courseData.courseTitle}
          </h1>
          <p
            className="pt-4 md:text-base text-sm"
            dangerouslySetInnerHTML={{
              __html: courseData.courseDescription.slice(0, 200),
            }}
          ></p>

          {/**review and ratings  */}
          <div className="flex items-center space-x-2 pt-3 pb-1 text-sm">
            <p>{calculateRating(courseData)}</p>
            <div className="flex ">
              {[...Array(5)].map((_, i) => (
                <img
                  className="w-3.5 h-3.5"
                  key={i}
                  src={
                    i < Math.floor(calculateRating(courseData))
                      ? assets.star
                      : assets.star_blank
                  }
                  alt=""
                />
              ))}
            </div>
            <p className="text-blue-600">
              ({courseData.courseRatings.length}{" "}
              {courseData.courseRatings.length > 1 ? "ratings" : "rating"})
            </p>
            <p>
              ({courseData.enrolledStudents.length}{" "}
              {courseData.enrolledStudents.length > 1 ? "students" : "student"})
            </p>
          </div>
          <p className="text-sm">
            Course by
            <span className="text-blue-600 underline">
              {" "}
              {courseData.educator?.name}
            </span>
          </p>
          <p className="text-sm pt-1">
  Category: 
  <span className="text-blue-600"> {courseData.category}</span>
</p>
          <div className="pt-8 text-gray-800">
            <h2 className="text-xl font-semibold">Course Structure</h2>
            <div className="pt-5 ">
              {courseData.courseContent.map((chapter, index) => (
                <div
                  key={index}
                  className="border border-gray-300 bg-white mb-2 rounded"
                >
                  <div
                    className="flex justify-between items-center px-4 py-3 cursor-pointer select-one"
                    onClick={() => toggleSection(index)}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={assets.down_arrow_icon}
                        alt="arrow_icon"
                        className={`transform transition-transform ${
                          openSections[index] ? "rotate-180" : ""
                        }`}
                      />
                      <p className="font-medium md:text-base text-sm">
                        {chapter.chapterTitle}
                      </p>
                    </div>
                    <p className="text-sm md:text-defult">
                      {chapter.chapterContent.length} lectures -{" "}
                      {calculateChapterTime(chapter)}
                    </p>
                  </div>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openSections[index] ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                      {chapter.chapterContent.map((lecture, i) => (
                        <li key={i} className="flex items-start gap-2 py-1">
                          <img
                            src={assets.play_icon}
                            alt="play_icon"
                            className="w-4 h-4 mt-1"
                          />
                          <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-defult">
                            <p>{lecture.lectureTitle}</p>
                            <div className="flex gap-2">
                              {lecture.isPreviewFree && (
                                <p
                                  onClick={() =>
                                    setPlayerData({
                                      videoId: lecture.lectureUrl
                                        .split("/")
                                        .pop(),
                                    })
                                  }
                                  className="text-blue-500 cursor pointer"
                                >
                                  Preview
                                </p>
                              )}
                              <p>
                                {humanizeDuration(
                                  lecture.lectureDuration * 60 * 1000,
                                  {
                                    units: ["h", "m"],
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="py-20 text-sm md:text-defult">
            <h3 className="text-xl font-semibold text-gray-800">
              Course Description
            </h3>
            <p
              className="pt-3 rich-text"
              dangerouslySetInnerHTML={{
                __html: courseData.courseDescription,
              }}
            ></p>
          </div>
        </div>

        {/** right column */}
        <div className="max-w-course-card z-10 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]">
          {playerData ? (
            <YouTube
              videoId={playerData.videoId}
              opts={{ playerVars: { autoplay: 1 } }}
              iframeClassName="w-full aspect-video"
            />
          ) : (
            <img src={courseData.courseThumbnail} alt="" />
          )}

          <div className="p-5">
            <div className="flex items-center gap-2">
              <img
                className="w-3.5"
                src={assets.time_left_clock_icon}
                alt="time_left_clock_icon"
              />
              <p className="text-red-500">
                {" "}
                <span className="font-medium">5 Days</span> left at this price !
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <p className="text-gray-800 md:text-4xl text-2xl font-semibold">
                {currency}
                {(
                  courseData.coursePrice -
                  (courseData.discount * courseData.coursePrice) / 100
                ).toFixed(2)}
              </p>
              <p className="md:text-lg text-gray-500 line-through">
                {currency}
                {courseData.coursePrice}
              </p>
              <p className="text-lg text-gray-500">
                {courseData.discount}% off
              </p>
            </div>

            <div className="flex items-center text-sm md:text-defult gap-4 pt-2 md:pt-4 text-gray-500">
              <div className="flex items-center gap-1">
                <img src={assets.star} alt="star icon" />
                <p>{calculateRating(courseData)}</p>
              </div>

              <div className="h-4 w-px bg-gray-500/40"></div>

              <div className="flex items-center gap-1">
                <img src={assets.time_clock_icon} alt="clock icon" />
                <p>{calculateCourseDuration(courseData)}</p>
              </div>

              <div className="h-4 w-px bg-gray-500/40"></div>

              <div className="flex items-center gap-1">
                <img src={assets.lesson_icon} alt="lesson_icon " />
                <p>{calculateNoOfLectures(courseData)} lessons</p>
              </div>
            </div>

            <button
              onClick={enrollCourse}
              className="md:mt-6 mt-4 w-full py-3 rounded text-white bg-blue-600 font-medium"
            >
              {isAlreadyEnrolled ? "Already Enrolled" : "Enroll Now"}
            </button>

            <div className="pt-6">
              <p className="md:text-xl text-lh font-medium text-gray-800">
                {" "}
                What's in the Course?
              </p>
              <ul className="ml-4 pt-2 text-sm md:text-defult text-gray-500 list-disc">
                <li>Lifetime access with free updates.</li>
                <li>Step-by-step hands-on project guidance.</li>
                <li> Downloadable resources and source code.</li>
                <li>Quizzes to test your knowledge.</li>
                <li>Cerificate of completion.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* Add this before the Footer component */}
{recommendedCourses.length > 0 && (
  <div className="w-full bg-gray-50 py-12 px-8 md:px-36">
    <h2 className="text-2xl font-bold text-gray-800 mb-6">Recommended For You</h2>
    {loadingRecommendations ? (
      <Loading />
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendedCourses.map((course) => (
          <div key={course._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img 
              src={course.courseThumbnail} 
              alt={course.courseTitle} 
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{course.courseTitle}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {course.courseDescription.replace(/<[^>]*>?/gm, '').slice(0, 100)}...
              </p>
              <div className="flex justify-between items-center">
                <span className="font-bold">
                  {currency}
                  {(course.coursePrice - (course.discount * course.coursePrice) / 100).toFixed(2)}
                </span>
                <a 
                  href={`/course/${course._id}`} 
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Course
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
      <Footer />
    </>
  ) : (
    <Loading />
  );
};

export default CourseDetails;
