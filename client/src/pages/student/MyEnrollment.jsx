import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { Line } from "rc-progress";
import Footer from "../../components/student/Footer";
import { toast } from "react-toastify";
import axios from "axios";

const MyEnrollment = () => {
  const {
    enrolledCourses,
    calculateCourseDuration,
    navigate,
    userData,
    fetchUserEnrolledCourses,
    backendUrl,
    getToken,
    calculateNoOfLectures,
  } = useContext(AppContext);

  const [progressArray, setProgressArray] = useState([]);
  const [certificateStatus, setCertificateStatus] = useState([]);

  const getCourseProgress = async () => {
    try {
      const token = await getToken();
      const tempProgressArray = await Promise.all(
        enrolledCourses.map(async (course) => {
          const { data } = await axios.post(
            `${backendUrl}/api/user/get-course-progress`,
            { courseId: course._id },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          let totalLectures = calculateNoOfLectures(course);
          const lectureCompleted = data.progressData
            ? data.progressData.lectureCompleted.length
            : 0;

          return { totalLectures, lectureCompleted };
        })
      );
      setProgressArray(tempProgressArray);
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  const previewAndDownloadCertificate = async (courseId) => {
  const url = `${backendUrl}/api/certificate_request/download?userId=${userData._id}&courseId=${courseId}`;

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    // Open preview in popup
    const popup = window.open("", "_blank", "width=1000,height=700");
    popup.document.write(`<html><head><title>Certificate Preview</title></head><body style="margin:0;">
      <img src="${blobUrl}" style="width:1000;height:700;" />
      <br/><a href="${blobUrl}" download="certificate.png" style="font-size:18px;display:inline-block;margin-top:10px;">Download</a>
    </body></html>`);
  } catch (err) {
    toast.error("Failed to preview certificate");
    console.error(err);
  }
};

 const fetchCertificateStatuses = async () => {
  try {
    const statuses = await Promise.all(
      enrolledCourses.map(async (course) => {
        try {
          const res = await axios.get(`${backendUrl}/api/certificate_request`, {
            params: {
              user_id: userData._id,
              course_id: course._id,
            },
          });

          const status = res.data?.status;
          if (status === "approved") return "Issued";
          if (status === "rejected") return "Rejected";
          return "Pending";
        } catch (err) {
          return "Not Requested";
        }
      })
    );
    setCertificateStatus(statuses);
  } catch (err) {
    console.error("Failed to fetch certificate statuses", err);
  }
};


  const calculateDaysLeft = (enrollmentDate, courseDuration) => {
    const enrollment = new Date(enrollmentDate);
    const currentDate = new Date();
    const daysSinceEnrollment = Math.floor(
      (currentDate - enrollment) / (1000 * 60 * 60 * 24)
    );
    const totalDurationDays = Math.floor(courseDuration / 24);
    const daysLeft = totalDurationDays - daysSinceEnrollment;
    return daysLeft > 0 ? daysLeft : 0;
  };

  const handleRequestCertificate = async (courseId, completedLectures, totalLectures) => {
    const progressPercentage = Math.round((completedLectures / totalLectures) * 100);
    const progressData = {
      enrollment_id: courseId,
      lessons_completed: completedLectures,
      progress_percentage: progressPercentage,
      current_status: progressPercentage === 100 ? 'Completed' : 'In Progress',
    };

    try {
      const token = await getToken();
      await axios.post(
        `${backendUrl}/api/progress/save`,
        progressData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/certificateRequestForm", {
        state: {
          courseId,
          userId: userData._id,
        },
      });
    } catch (error) {
      console.error("Error saving progress:", error);
      toast.error("Failed to request certificate.");
    }
  };

  useEffect(() => {
    if (userData) {
      fetchUserEnrolledCourses();
    }
  }, [userData]);

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseProgress();
      fetchCertificateStatuses(); // Fetch statuses
    }
  }, [enrolledCourses]);

  return (
    <>
      <div className="md:px-36 px-8 py-10">
        <h1 className="text-2xl font-semibold">My Enrollments</h1>
        <table className="md:table-auto table-fixed w-full overflow-hidden border mt-10">
          <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left max-sm:hidden">
            <tr>
              <th className="px-4 py-3 font-semibold truncate">Course</th>
              <th className="px-4 py-3 font-semibold truncate">Duration</th>
              <th className="px-4 py-3 font-semibold truncate">Completed</th>
              <th className="px-4 py-3 font-semibold truncate">Days Left</th>
              <th className="px-4 py-3 font-semibold truncate">Status</th>
              <th className="px-4 py-3 font-semibold truncate">Certificate</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {enrolledCourses.map((course, index) => (
              <tr key={index} className="border-b border-gray-500/20">
                <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3">
                  <img
                    src={course.courseThumbnail}
                    alt=""
                    className="w-14 sm:w-24 md:w-28"
                  />
                  <div className="flex-1">
                    <p className="text-sm mb-1 max-sm:text-sm">
                      {course.courseTitle}
                    </p>
                    <Line
                      strokeWidth={2}
                      percent={
                        progressArray[index]
                          ? (progressArray[index].lectureCompleted * 100) /
                            progressArray[index].totalLectures
                          : 0
                      }
                      className="bg-gray-300 rounded-full"
                    />
                  </div>
                </td>
                <td className="px-4 py-3 max-sm:hidden">
                  {calculateCourseDuration(course)}
                </td>
                <td className="px-4 py-3 max-sm:hidden">
                  {progressArray[index] &&
                    `${progressArray[index].lectureCompleted} / ${progressArray[index].totalLectures}`}{" "}
                  <span>Lectures</span>
                </td>
                <td className="px-4 py-3">
                  {userData && progressArray[index]
                    ? `${calculateDaysLeft(
                        userData.createdAt,
                        course.courseDuration
                      )} Days`
                    : "N/A"}
                </td>
                <td className="px-4 py-3 max-sm:text-right">
                  <button
                    className="px-3 sm:px-5 py-1.5 sm:py-2 bg-blue-600 max-sm:text-xs text-white"
                    onClick={() => navigate(`/player/` + course._id)}
                  >
                    {progressArray[index] &&
                    progressArray[index].lectureCompleted /
                      progressArray[index].totalLectures === 1
                      ? "Completed"
                      : "On Going"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="mb-1">
                    <span className={`text-sm font-medium ${
                      certificateStatus[index] === "Issued"
                      ? "text-green-600"
                      : certificateStatus[index] === "Rejected"
                      ? "text-red-600"
                      : certificateStatus[index] === "Pending"
                      ? "text-yellow-600"
                      : "text-gray-500"}`}>
                        {certificateStatus[index] || "Loading..."}
                        </span>

                  </div>
                  {certificateStatus[index] === "Issued" ? (
                    <button
  className="px-3 sm:px-5 py-1.5 sm:py-2 bg-purple-600 text-white rounded inline-block"
  onClick={() => previewAndDownloadCertificate(course._id)}
>
  Download Certificate
</button>

) : (
  <button
    className="px-3 sm:px-5 py-1.5 sm:py-2 bg-green-600 text-white rounded"
    onClick={() =>
      handleRequestCertificate(
        course._id,
        progressArray[index]?.lectureCompleted || 0,
        progressArray[index]?.totalLectures || 1
      )
    }
  >
    Request Certificate
  </button>
)}

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Footer />
    </>
  );
};

export default MyEnrollment;
