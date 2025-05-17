import React, { useEffect, useState, useRef } from "react";
import { assets } from "../assets/assets";
import Loading from "../components/Loading";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";
import { currency } from "../App";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const EduactorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const pdfRef = useRef();

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/educator/dashboard");
      if (data.success) {
        setDashboardData(data.dashboardData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const generatePDF = async () => {
    try {
      setLoadingPdf(true);
      const element = pdfRef.current;
      
      // Increase scale for better quality
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        scrollY: -window.scrollY,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('educator_dashboard_report.pdf');
    } catch (error) {
      toast.error("Failed to generate PDF");
      console.error(error);
    } finally {
      setLoadingPdf(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Prepare data for the chart
  const chartData = {
    labels: dashboardData?.dailyRevenue?.map(item => item.date) || [],
    datasets: [
      {
        label: 'Daily Revenue',
        data: dashboardData?.dailyRevenue?.map(item => item.amount) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Daily Revenue',
      },
    },
  };

  return dashboardData ? (
    <div className="min-h-screen flex flex-col items-start justify-between gap-8 md:p-8 md:pb-0 p-4 pt-8 pb-0" ref={pdfRef}>
      {/* PDF Export Button */}
      <div className="w-full flex justify-end mb-4">
        <button
          onClick={generatePDF}
          disabled={loadingPdf}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          {loadingPdf ? (
            'Generating PDF...'
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Export as PDF
            </>
          )}
        </button>
      </div>

      <div className="space-y-5 w-full">
        <div className="flex flex-wrap gap-5 items-center">
          <div className="flex items-center gap-3 shadow-card border border-blue-500 p-4 w-56 rounded-md">
            <img src={assets.patients_icon} alt="" />
            <div>
              <p className="text-2xl font-medium text-gray-600">
                {dashboardData.enrolledStudentsData.length}
              </p>
              <p className="text-base text-gray-500">Total Enrollments</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shadow-card border border-blue-500 p-4 w-56 rounded-md">
            <img src={assets.appointments_icon} alt="" />
            <div>
              <p className="text-2xl font-medium text-gray-600">
                {dashboardData.totolCourses}
              </p>
              <p className="text-base text-gray-500">Total Courses</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shadow-card border border-blue-500 p-4 w-56 rounded-md">
            <img src={assets.earning_icon} alt="" />
            <div>
              <p className="text-2xl font-medium text-gray-600">
                {currency}
                {dashboardData.totalEarnings}
              </p>
              <p className="text-base text-gray-500">Total Earnings</p>
            </div>
          </div>
        </div>

        {/* Revenue Chart Section */}
        <div className="bg-white p-4 rounded-md shadow-md">
          <h2 className="text-lg font-semibold mb-4">Revenue Analytics</h2>
          <div className="h-64">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Best and Weak Courses Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Best Courses */}
          <div className="bg-white p-4 rounded-md shadow-md">
            <h2 className="text-lg font-semibold mb-4">Top Performing Courses</h2>
            {dashboardData.bestCourses.length > 0 ? (
              <ul className="space-y-3">
                {dashboardData.bestCourses.map((course, index) => (
                  <li key={index} className="flex items-center justify-between p-2 border-b">
                    <div>
                      <h3 className="font-medium">{course.courseTitle}</h3>
                      <p className="text-sm text-gray-500">
                        Enrollments: {course.enrollCount} | Rating: {course.avgRating.toFixed(1)}
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      Best
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No top performing courses yet</p>
            )}
          </div>

          {/* Weak Courses */}
          <div className="bg-white p-4 rounded-md shadow-md">
            <h2 className="text-lg font-semibold mb-4">Courses Needing Improvement</h2>
            {dashboardData.weakCourses.length > 0 ? (
              <ul className="space-y-3">
                {dashboardData.weakCourses.map((course, index) => (
                  <li key={index} className="flex items-center justify-between p-2 border-b">
                    <div>
                      <h3 className="font-medium">{course.courseTitle}</h3>
                      <p className="text-sm text-gray-500">
                        Enrollments: {course.enrollCount} | Rating: {course.avgRating.toFixed(1)}
                      </p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                      Needs Work
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">All courses are performing well</p>
            )}
          </div>
        </div>

        {/* Latest Enrollments Section */}
        <div>
          <h2 className="pb-4 text-lg font-medium">Latest Enrollments</h2>
          <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
            <table className="table-fixed md:table-auto w-full overflow-hidden">
              <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-center hidden sm:table-cell">#</th>
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold">Course Title</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-500">
                {dashboardData.enrolledStudentsData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-500/20">
                    <td className="px-4 py-3 text-center hidden sm:table-cell">{index + 1}</td>
                    <td className="md:px-4 px-2 py-3 flex items-center space-x-3">
                      <img
                        src={item.student.imageUrl}
                        alt="Profile"
                        className="w-9 h-9 rounded-full"
                      />
                      <span className="truncate">{item.student.name}</span>
                    </td>
                    <td className="px-4 py-3 truncate">{item.courseTitle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default EduactorDashboard;