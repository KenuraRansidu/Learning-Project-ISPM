import mongoose from 'mongoose';   //Import mongoose to define schema and interact with MongoDB
import { v4 as uuidv4 } from 'uuid'; // Import uuidv4 to generate unique IDs

const progressSchema = new mongoose.Schema({   // Define the schema for tracking a student's progress in a course (collection of progress schema)
  progress_id: { type: String, required: true, unique: true, default: uuidv4 },  // Unique identifier 
  enrollment_id: { type: String, required: true }, 
  lessons_completed: { type: Number, default: 0 }, 
  progress_percentage: { type: mongoose.Types.Decimal128, default: 0.0 }, 
  current_status: {          
    type: String,
    enum: ['In Progress', 'Completed'],
    default: 'In Progress'
  }
});

const Progress = mongoose.models.Progress|| mongoose.model('Progress', progressSchema); // Create or reuse the Progress model to prevent errors on hot reload
export default Progress; // Export the model for use in controllers, routes, etc.
 