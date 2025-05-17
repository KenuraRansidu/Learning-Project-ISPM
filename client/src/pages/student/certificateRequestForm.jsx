import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/apiClient';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { toast } from "react-toastify";

const CertificateRequestForm = () => {
  const { user } = useUser();
  const location = useLocation();
  const { courseId, userId } = location.state || {};
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    student_name: '',
    course_name: '',
    submission_date: '',
    progress: 0,
    certificate_issued: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await apiClient.get('/api/certificate_request', {
          params: { user_id: userId, course_id: courseId },
        });
        setFormData((prev) => ({ ...prev, ...response.data }));
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log('No existing certificate request found. This is likely a new submission.');

          try {
            const courseResponse = await apiClient.get(`/api/course/${courseId}`);
            const courseName = courseResponse.data?.courseData?.name || courseResponse.data?.courseData?.courseTitle || '';

            let progressValue = 0;
            try {
              const progressResponse = await apiClient.post(`/api/user/get-course-progress`, {
                courseId
              });
              const completed = progressResponse.data?.progressData?.lectureCompleted?.length || 0;
              const total = courseResponse.data?.courseData?.courseContent?.reduce((acc, chapter) => acc + chapter.chapterContent.length, 0) || 1;
              progressValue = Math.round((completed / total) * 100);
            } catch (progressError) {
              console.warn('Could not fetch progress:', progressError);
            }

            setFormData((prev) => ({
              ...prev,
              student_name: user?.fullName || '',
              course_name: courseName,
              submission_date: new Date().toISOString().slice(0, 10),
              progress: progressValue,
            }));
          } catch (courseError) {
            console.error('Error fetching course data:', courseError);
          }
        } else {
          console.error('Error fetching certificate data:', error);
        }
      }
    };

    if (userId && courseId) {
      fetchFormData();
    }
  }, [userId, courseId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameRegex = /^[a-zA-Z\s]*$/;
    const newErrors = {};

    if (!nameRegex.test(formData.student_name)) {
      newErrors.student_name = 'Only letters and spaces are allowed for the Student Name.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
  const payload = {
    ...formData,
    user_id: userId,
    course_id: courseId,
    progress: String(formData.progress),
  };
  await apiClient.post('/api/certificate_request', payload);

  navigate('/my-enrollments', { state: { courseId, userId } });
  toast.success("Certificate Request Sent");
} catch (error) {
  console.error('Error submitting certificate request:', error.response?.data || error.message);
  alert('Failed to submit the certificate request. Please try again.');
}

  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prevErrors) => ({ ...prevErrors, [e.target.name]: '' }));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-5">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">Certificate Request Form</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium">Name on Certificate</label>
            <input
              type="text"
              name="student_name"
              value={formData.student_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="mt-2 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            {errors.student_name && <span className="text-red-500 text-sm mt-1">{errors.student_name}</span>}
          </div>

          <div className="flex flex-col">
            <label className="text-gray-700 font-medium">Course Name</label>
            <input
              type="text"
              value={formData.course_name}
              disabled
              className="mt-2 p-3 bg-gray-100 rounded-lg border border-gray-300 text-gray-600"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-700 font-medium">Submission Date</label>
            <input
              type="date"
              value={formData.submission_date?.slice(0, 10)}
              disabled
              className="mt-2 p-3 bg-gray-100 rounded-lg border border-gray-300 text-gray-600"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-700 font-medium">Progress (%)</label>
            <input
              type="number"
              value={formData.progress}
              disabled
              className="mt-2 p-3 bg-gray-100 rounded-lg border border-gray-300 text-gray-600"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-700 font-medium">Certificate Issued</label>
            <input
              type="text"
              value={formData.certificate_issued ? "Yes" : "No"}
              disabled
              className="mt-2 p-3 bg-gray-100 rounded-lg border border-gray-300 text-gray-600"
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Request Certificate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CertificateRequestForm;
