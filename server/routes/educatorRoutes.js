import express from "express";
import { addCourse, getEducatorCourses, updateRoleToEducator ,getEducatorDashboardData, getEnrolledStudentsData, requestEducatorRole ,deleteCourse,updateCourse} from "../controllers/educatorController.js";
import upload from "../configs/multer.js";
import { protectEducator } from "../middlewares/authMiddleware.js";
import CertificateRequest from "../models/certificateRequestModel.js";

const educatorRouter = express.Router();

// added from here
educatorRouter.get("/request-role", requestEducatorRole)
educatorRouter.get("/update-role", updateRoleToEducator)
educatorRouter.post("/add-course", upload.single('image'), addCourse)
educatorRouter.get("/courses", getEducatorCourses)
educatorRouter.get("/dashboard", getEducatorDashboardData)
educatorRouter.get("/enrolled-students", getEnrolledStudentsData)
educatorRouter.delete("/delete-course/:courseId", deleteCourse)
educatorRouter.put('/update-course/:courseId', updateCourse);

educatorRouter.post('/approve-certificate', async (req, res) => {
  const { requestId } = req.body;
  try {
    const request = await CertificateRequest.findByIdAndUpdate(
      requestId,
      { certificate_issued: true, status: 'approved' },
      { new: true }
    );
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    res.json({ success: true, message: 'Certificate approved' });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

educatorRouter.post('/decline-certificate', async (req, res) => {
  const { requestId } = req.body;
  try {
    const request = await CertificateRequest.findByIdAndUpdate(
      requestId,
      { certificate_issued: false, status: 'rejected' },
      { new: true }
    );
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    res.json({ success: true, message: 'Certificate request rejected (but retained in DB)' });
  } catch (err) {
    console.error('Decline error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
// here

export default educatorRouter;