import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks, stripeWebhooks } from "./controllers/webhooks.js";
import educatorRouter from "./routes/educatorRoutes.js";
import { clerkMiddleware } from "@clerk/express";
import connectCloudinary from "./configs/cloudinary.js";
import courseRouter from "./routes/courseRoutes.js";
import userRouter from "./routes/userRoutes.js";
import adminRouter from "./routes/adminRouter.js";
import bookRoutes from "./routes/bookRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import certificateRequestRoutes from "./routes/certificateRequestRoutes.js";


//initialize express
const app = express();
const origins = ['http://localhost:5173','http://localhost:5174']

//Connect to database
await connectDB();
await connectCloudinary();

//middleware
app.use(cors({
  origin: origins, // frontend URL
  credentials: true, // allow cookies/auth headers
}));
app.use(clerkMiddleware());

//routes
app.get("/", (req, res) => res.send("API Working"));
app.post("/clerk", express.json(), clerkWebhooks);
app.use("/api/educator", express.json(), educatorRouter);
app.use('/api/course', express.json(), courseRouter);
app.use('/api/user', express.json(), userRouter);
app.use("/api/admin", express.json(), adminRouter);
app.use("/stripe", express.raw({type: 'application/json'}), stripeWebhooks);
app.use('/api/books', express.json(), bookRoutes);
app.use('/api/orders', express.json(), orderRouter);
app.use("/api/progress",express.json(), progressRoutes);
app.use('/api/certificate_request',express.json(), certificateRequestRoutes);


//port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
