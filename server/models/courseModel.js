import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const courseSchema = new mongoose.Schema({
  course_id: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, default: uuidv4 }, // define the collection of course schema
  course_name: { type: String, required: true },
  course_description: { type: String },
  duration: { type: Number, required: true } // in days
});

const Course = mongoose.models.Course||mongoose.model('Course', courseSchema);
export default Course;


