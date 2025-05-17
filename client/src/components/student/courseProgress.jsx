import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../api/apiClient";
import { END_POINTS } from "../api/endPoints";
import { ROUTES } from "../routes/paths";

const CourseProgress = () => {
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [completed, setCompleted] = useState([]);
  const navigate = useNavigate();
  const { courseId } = useParams(); // ✅ Get course ID from URL

  const hardcodedLessons = [
    { lesson_id: 1, lesson_title: "Lesson 1: Introduction", lesson_content: "Introduction to the course" },
    { lesson_id: 2, lesson_title: "Lesson 2: Basics of JavaScript", lesson_content: "Learning JavaScript basics" },
    { lesson_id: 3, lesson_title: "Lesson 3: Functions", lesson_content: "Understanding functions in JS" },
    { lesson_id: 4, lesson_title: "Lesson 4: Objects", lesson_content: "Learn about objects in JavaScript" },
    { lesson_id: 5, lesson_title: "Lesson 5: Arrays", lesson_content: "Learn about arrays in JS" },
    { lesson_id: 6, lesson_title: "Lesson 6: Loops", lesson_content: "Understanding loops in JS" },
    { lesson_id: 7, lesson_title: "Lesson 7: DOM Manipulation", lesson_content: "Learn about the DOM" },
    { lesson_id: 8, lesson_title: "Lesson 8: Events", lesson_content: "Handling events in JavaScript" },
  ];

  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        const courseRes = await apiClient.get(END_POINTS.GET_COURSE_BY_ID(courseId));
        setCourse(courseRes.data);
        setLessons(hardcodedLessons);
      } catch (error) {
        console.error("Error fetching course:", error);
      }
    };

    fetchCourse();
  }, [courseId]);

  const toggleLesson = (index) => {
    setCompleted((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const progressPercent = lessons.length
    ? Math.round((completed.length / lessons.length) * 100) //calculate progress percentage
    : 0;

  const handleSubmit = async () => {
    const progressData = {
      enrollment_id: courseId, // Assuming courseId represents the enrollment ID
      lessons_completed: completed.length,
      progress_percentage: progressPercent,
      current_status: progressPercent === 100 ? 'Completed' : 'In Progress',
    };

    try {
      await apiClient.post(END_POINTS.SAVE_PROGRESS, progressData);  // POST request to save progress
      // Navigate to certificate request page after saving progress
      navigate(ROUTES.REQUEST_CERTIFICATE, {
        state: {
          courseId, // Pass courseId to the certificate request page
        },
      });
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-5">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-blue-800 text-center mb-6">
          {course ? `Course: ${course.course_name}` : "Loading course..."}
        </h1>

        {lessons.length > 0 && (
          <div className="mb-6">
            <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-right text-blue-700 font-medium">
              {completed.length} of {lessons.length} lessons completed ({progressPercent}%)
            </p>
          </div>
        )}

        {lessons.map((lesson, index) => (
          <div
            key={lesson.lesson_id}
            className={`border p-4 rounded-lg mb-4 ${completed.includes(index) ? "bg-green-100" : "bg-white"}`}
          >
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={completed.includes(index)}
                onChange={() => toggleLesson(index)}
                className="mr-4 mt-1"
              />
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Lesson {index + 1}: {lesson.lesson_title}
                </h2>
                <p className="text-gray-600 mt-1">{lesson.lesson_content}</p>
              </div>
            </div>
          </div>
        ))}

        {completed.length === lessons.length && lessons.length > 0 && (
          <button
            onClick={handleSubmit}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-md text-lg font-semibold mt-6"
          >
            Request Certificate
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseProgress;
