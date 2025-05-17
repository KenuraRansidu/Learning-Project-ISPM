// models/certificateRequestModel.js
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const CertificateRequestSchema = new mongoose.Schema({
  request_id: { type: String, unique: true, default: uuidv4 },
  user_id: { type: String, required: true },
  course_id: { type: String, required: true },
  student_name: { type: String, required: true },
  // start_date: { type: Date, required: false },
  // end_date: { type: Date, required: false },
  progress: { type: String, required: true }, // stored as string
  certificate_issued: { type: Boolean, default: false },
  status: {type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending'},
}, { timestamps: true });

const CertificateRequest = mongoose.model('CertificateRequest', CertificateRequestSchema);
export default CertificateRequest;
