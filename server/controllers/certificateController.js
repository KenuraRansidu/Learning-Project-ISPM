import mongoose from "mongoose";
import CertificateRequest from "../models/certificateRequestModel.js";
import User from "../models/userModel.js";
import Course from "../models/courseModel.js";
import Enrollment from "../models/enrollmentModel.js";
import Progress from "../models/progressModel.js";

// Get data to pre-fill certificate request form
const getCertificateFormData = async (req, res) => {
    try {
      const { user_id, course_id } = req.query;

      //  Validate User
      const user = await User.findOne({ user_id });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      //  Validate Course
      const course = await Course.findOne({ course_id });
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      //  Get Enrollment
      const enrollment = await Enrollment.findOne({ user_id, course_id });
      if (!enrollment) {
        return res.status(404).json({ error: 'Enrollment not found' });
      }

      //  Get Progress
      const progress = await Progress.findOne({ enrollment_id: enrollment.enrollment_id });
      if (!progress) {
        return res.status(404).json({ error: 'Progress not found' });
      }

      //  Calculate Dates
      const start_date = enrollment.enrollment_date;
      const end_date = new Date(start_date);
      end_date.setDate(end_date.getDate() + course.duration);

      //  Return all needed data
      res.status(200).json({
        course_name: course.course_name,
        start_date,
        end_date,
        submission_date: new Date(),
        progress: parseFloat(progress.progress_percentage.toString()), // Convert from Decimal128
        certificate_issued: false
      });

    } catch (error) {
      console.error("Error fetching certificate form data:", error);
      res.status(500).json({ error: 'Server error' });
    }
  };
  

  const createCertificateRequest = async (req, res) => {
    try {
      const {
        user_id,
        course_id,
        student_name,
        start_date,
        end_date,
        submission_date,
        progress,
        certificate_issued
      } = req.body;

      const newRequest = new CertificateRequest({
        user_id,
        course_id,
        student_name,
        start_date,
        end_date,
        submission_date,
        progress: mongoose.Types.Decimal128.fromString(progress.toString()),
        certificate_issued
      });

      await newRequest.save();
      res.status(201).json({ message: "Certificate request submitted successfully" });
    } catch (error) {
      console.error("Error saving certificate request:", error);
      res.status(500).json({ error: "Server error" });
    }

  };


  // Get all certificate requests with extra details populated
const getCertificateRequests = async (req, res) => {
  try {
    // Get all certificate requests
    const certificateRequests = await CertificateRequest.find();

    // Fetch related course and user data for each request

    const detailedRequests = await Promise.all( // awaits until all data is fetched
      certificateRequests.map(async (request) => {
        const user = await User.findOne({ user_id: request.user_id });
        const course = await Course.findOne({ course_id: request.course_id });

        return {
          request_id: request.request_id,
          student_name: request.student_name,
          user_id: request.user_id,
          user_email: user?.email,
          course_id: request.course_id,
          course_name: course?.course_name,
          start_date: request.start_date,
          end_date: request.end_date,
          submission_date: request.submission_date,
          progress: parseFloat(request.progress.toString()),
          certificate_issued: request.certificate_issued,
        };
      })
    );

    res.status(200).json({ certificateRequests: detailedRequests });
  } catch (error) {
    console.error("Error fetching certificate requests: ", error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

//update certificate status
export const toggleCertificateStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate =await CertificateRequest.findOne({ request_id: id });
    if (!certificate) return res.status(404).json({ message: "Request not found" });

    //boolean values
    certificate.certificate_issued = !certificate.certificate_issued;

    await certificate.save();
    res.status(200).json({ message: "Status updated", certificate });
  } catch (error) {
    console.error("Error toggling certificate status:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

//delete certificate request

export const deleteCertificateRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRequest = await CertificateRequest.findOneAndDelete({ request_id: id });

    if (!deletedRequest) {
      return res.status(404).json({ message: "Certificate request not found" });
    }

    res.status(200).json({ message: "Certificate request deleted successfully" });
  } catch (error) {
    console.error("Error deleting certificate request:", error);
    res.status(500).json({ error: "Server error" });
  }
};





  export {getCertificateFormData, getCertificateRequests, createCertificateRequest};
