import express from 'express';
import CertificateRequest from '../models/certificateRequestModel.js';
import Course from '../models/courseModel.js';
import path from "path";
import { createCanvas, loadImage } from "canvas";


const router = express.Router();

// GET /api/certificate_request
router.get('/', async (req, res) => {
  const { user_id, course_id } = req.query;

  try {
    if (user_id && course_id) {
      const request = await CertificateRequest.findOne({ user_id, course_id });
      if (!request) {
        return res.status(404).json({ error: 'Certificate request not found' });
      }

      const course = await Course.findById(request.course_id).select('name');

      return res.json({
        ...request.toObject(),
        course_name: course?.name || 'Unknown Course',
      });
    } else {
      const allRequests = await CertificateRequest.find({});

      const requestsWithCourseNames = await Promise.all(
        allRequests.map(async (req) => {
          const course = await Course.findById(req.course_id);
          return {
            ...req.toObject(),
            course_name: course?.courseTitle || 'Unknown Course',
          };
        })
      );

      return res.json(requestsWithCourseNames);
    }
  } catch (err) {
    console.error('Error fetching certificate request(s):', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      course_id,
      student_name,
      progress,
      certificate_issued
    } = req.body;

    if (!user_id || !course_id || !student_name || !progress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newRequest = new CertificateRequest({
      user_id,
      course_id,
      student_name,
      progress,
      certificate_issued: certificate_issued || false,
    });

    await newRequest.save();
    res.status(201).json({ message: 'Certificate request submitted.' });

  } catch (error) {
    console.error('Error creating certificate request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/certificate_request/status?user_id=...&course_id=...
router.get('/status', async (req, res) => {
  const { user_id, course_id } = req.query;
  try {
    if (!user_id || !course_id) {
      return res.status(400).json({ error: 'Missing user_id or course_id' });
    }

    const request = await CertificateRequest.findOne({ user_id, course_id });
    if (!request) {
      return res.status(200).json({ certificate_issued: false });
    }

    return res.json({
      certificate_issued: request.certificate_issued,
    });
  } catch (err) {
    console.error('Error checking certificate status:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get("/download", async (req, res) => {
  const { userId, courseId } = req.query;

  try {
    const request = await CertificateRequest.findOne({ user_id: userId, course_id: courseId });
    if (!request) {
      return res.status(404).send("Certificate request not found");
    }

    const course = await Course.findById(courseId);
    const courseName = course?.courseTitle || "Unknown Course";
    const userName = request.student_name || "Student";
    const date = new Date().toLocaleDateString();
    const certTemplatePath = path.resolve("assets/CompletionCertificate.png");
    const image = await loadImage(certTemplatePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(image, 0, 0, image.width, image.height);
    ctx.fillStyle = "#222"; 
    ctx.textAlign = "center";
    ctx.font = "bold 60px serif";
    ctx.fillText(userName, 1000, 720); 
    ctx.textAlign = "left";
    ctx.font = "bold 48px serif";
    ctx.fillText(courseName, 430, 960); 

    ctx.textAlign = "right";
    ctx.fillText(date, 1770, 960);

    const buffer = canvas.toBuffer("image/png");

    res.set({
      "Content-Type": "image/png",
      "Content-Disposition": `inline; filename="${userName}-Certificate.png"`,
    });

    res.send(buffer);
  } catch (err) {
    console.error("Certificate generation failed:", err);
    res.status(500).send("Certificate generation failed");
  }
});


export default router;
