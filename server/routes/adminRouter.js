import express from "express";
import {
  getAllEducators,
  getAllRolesRequests,
  removeUserRole,
  updateRoleToEducator,
  adminLogin,
} from "../controllers/adminController.js";

const adminRouter = express.Router();

//Add Educator Role
adminRouter.get("/all-requests", getAllRolesRequests);
adminRouter.put("/update-role/:userId", updateRoleToEducator);
adminRouter.put("/removeRole/:userId", removeUserRole);
adminRouter.get("/all-educators", getAllEducators);
adminRouter.post("/login", adminLogin);

export default adminRouter;
