import mongoose from 'mongoose';
import {v4 as uuidv4} from 'uuid';

const userSchema = new mongoose.Schema({   // define schema and work with MongoDB
  user_id: { type: String, required: true, unique: true, default: uuidv4,}, // Unique identifier for the user, generated with UUID
  name: { type: String, required: true },  
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
