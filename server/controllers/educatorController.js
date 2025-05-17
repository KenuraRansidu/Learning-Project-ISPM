import { clerkClient } from "@clerk/express";
import Course from "../models/Course.js";
import { v2 as cloudinary } from "cloudinary";
import Purchase from "../models/Purchase.js";
import User from "../models/User.js";

//Request Eduacator Role
export const requestEducatorRole = async (req, res) => {
  try {
    const userId = req.auth.userId;
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "pending",
      },
    });
    res.json({ success: true, message: "Your request has been sent to admin" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Update user role to educator
export const updateRoleToEducator = async (req, res) => {
  try {
    const userId = req.auth.userId;
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "educator",
      },
    });
    res.json({ success: true, message: "You can publish course now" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Add new course
export const addCourse = async (req, res) => {
  try {
    const { courseData } = req.body;
    const imageFile = req.file;
    const educatorId = process.env.COURSE_EDUCATOR_ID;

    if (!imageFile) {
      return res.json({ success: false, message: " Thumbnail Not Attached" });
    }

    const parsedCourseData = JSON.parse(courseData);
    parsedCourseData.educator = educatorId;

    const newCourse = await Course.create(parsedCourseData);

    const imageUpload = await cloudinary.uploader.upload(imageFile.path);
    newCourse.courseThumbnail = imageUpload.secure_url;

    await newCourse.save();

    res.json({ success: true, message: "Course Added Successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Get Educator Courses
export const getEducatorCourses = async (req, res) => {
  try {
    const educator = process.env.COURSE_EDUCATOR_ID;
    const courses = await Course.find({ educator });
    res.json({ success: true, courses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Get Educator Dashboard Data(Total Earning,Enrolled Students,No. of Courses)
export const getEducatorDashboardData = async (req, res) => {
  try {
    const educator = process.env.COURSE_EDUCATOR_ID;
    const courses = await Course.find({ educator });
    const totolCourses = courses.length;

    const courseIds = courses.map((course) => course._id);

    // Calculate total earnings from purchases
    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    });

    const totalEarnings = purchases.reduce(
      (sum, purchase) => sum + purchase.amount,
      0
    );

    // Calculate daily revenue
    const dailyRevenue = {};
    purchases.forEach((purchase) => {
      const date = new Date(purchase.createdAt).toISOString().split('T')[0];
      dailyRevenue[date] = (dailyRevenue[date] || 0) + purchase.amount;
    });

    // Identify best and weak courses
    const analyzedCourses = await Promise.all(courses.map(async (course) => {
      const ratingCount = course.courseRatings.length;
      const avgRating = ratingCount > 0 
        ? course.courseRatings.reduce((sum, r) => sum + r.rating, 0) / ratingCount
        : 0;
      
      return {
        ...course.toObject(),
        enrollCount: course.enrolledStudents.length,
        avgRating
      };
    }));

    const bestCourses = analyzedCourses
      .filter(c => c.enrollCount >= 3 && c.avgRating >= 3)
      .sort((a, b) => b.enrollCount - a.enrollCount)
      .slice(0, 3);

    const weakCourses = analyzedCourses
      .filter(c => c.enrollCount <= 3 || c.avgRating < 4)
      .sort((a, b) => a.enrollCount - b.enrollCount)
      .slice(0, 3);

    // Collect unique enrolled students Ids with their course titles
    const enrolledStudentsData = [];
    for (const course of courses) {
      const students = await User.find(
        {
          _id: { $in: course.enrolledStudents },
        },
        "name imageUrl"
      );
      students.forEach((student) => {
        enrolledStudentsData.push({
          courseTitle: course.courseTitle,
          student,
        });
      });
    }

    res.json({
      success: true,
      dashboardData: { 
        totalEarnings, 
        totolCourses, 
        enrolledStudentsData,
        dailyRevenue: Object.entries(dailyRevenue).map(([date, amount]) => ({ date, amount })),
        bestCourses,
        weakCourses
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Get Enrolled Students data with Purchase Data
export const getEnrolledStudentsData = async (req, res) => {
  try {
    const educator = process.env.COURSE_EDUCATOR_ID;
    const courses = await Course.find({ educator });
    const courseIds = courses.map((course) => course._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    })
      .populate("userId", "name imageUrl")
      .populate("courseId", "courseTitle");

    const enrolledStudents = purchases.map((purchase) => ({
      student: purchase.userId,
      courseTitle: purchase.courseId.courseTitle,
      purchaseData: purchase.createdAt,
    }));

    res.json({ success: true, enrolledStudents });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Delete a course
export const deleteCourse = async (req, res) => {
  try {
    const educator = process.env.COURSE_EDUCATOR_ID;
    const { courseId } = req.params;

    const course = await Course.findOne({ _id: courseId, educator });
    if (!course) {
      return res.json({ success: false, message: "Course not found or you don't have permission to delete it" });
    }

    // Delete course thumbnail from Cloudinary
    if (course.courseThumbnail) {
      const publicId = course.courseThumbnail.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    // Delete associated purchases
    await Purchase.deleteMany({ courseId });

    // Delete the course
    await Course.deleteOne({ _id: courseId });

    res.json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Update course
export const updateCourse = async (req, res) => {
  try {
    const educator = process.env.COURSE_EDUCATOR_ID;
    const { courseId } = req.params;
    const { courseData } = req.body;

    const course = await Course.findOne({ _id: courseId, educator });
    if (!course) {
      return res.json({ success: false, message: "Course not found or you don't have permission to update it" });
    }

    // Update course fields
    course.courseTitle = courseData.courseTitle;
    course.courseDescription = courseData.courseDescription;
    course.coursePrice = courseData.coursePrice;
    course.discount = courseData.discount;
    course.category = courseData.category;

    await course.save();

    res.json({ success: true, message: "Course updated successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};