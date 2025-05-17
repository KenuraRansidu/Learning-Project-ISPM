import { clerkClient } from "@clerk/express";
import jwt from "jsonwebtoken";

// Route for admin login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const updateRoleToEducator = async (req, res) => {
  try {
    const { userId } = req.params;
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

export const removeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "default",
      },
    });
    res.json({ success: true, message: "User role removed" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Retrieve all users with the role "pending"
export const getAllRolesRequests = async (_, res) => {
  try {
    const usersResponse = await clerkClient.users.getUserList({
      limit: 100,
    });
    const pendingUsers = usersResponse.data.filter(
      (user) => user.publicMetadata.role === "pending"
    );
    const userDetails = pendingUsers.map((user) => ({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      imageUrl: user.imageUrl,
    }));
    res.json({ success: true, users: userDetails });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getAllEducators = async (_, res) => {
  try {
    const usersResponse = await clerkClient.users.getUserList({
      limit: 100,
    });
    const educators = usersResponse.data.filter(
      (user) => user.publicMetadata.role === "educator"
    );
    const userDetails = educators.map((user) => ({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      imageUrl: user.imageUrl,
    }));
    res.json({ success: true, users: userDetails });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
