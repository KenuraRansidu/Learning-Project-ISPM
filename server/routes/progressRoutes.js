// progressRoutes.js
import express from 'express';
import { saveOrUpdateProgress } from "../controllers/progressController.js"

const router = express.Router();

// Route to save or update progress
router.post('/save', saveOrUpdateProgress);

export default router;