import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const enrollmentSchema = new mongoose.Schema({       // Define the schema for course enrollments
  enrollment_id: { type: String, required: true, unique: true, default: uuidv4 },
  user_id: { type: String, required: true },   // UUID reference
  course_id: { type: String, required: true }, // UUID reference
  enrollment_date: { type: Date, default: Date.now }
});

const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema);
export default Enrollment;

