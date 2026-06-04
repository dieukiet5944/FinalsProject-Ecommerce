import express from 'express';
import adminController from '../controller/adminController.js';
import { checkloginAD } from '../middleware/checkLoginadmin.js';

const adminRouter = express.Router();

adminRouter.get("/:id", adminController.getAdmin);

adminRouter.post("/register", adminController.registerAdmin );

adminRouter.post("/login", checkloginAD, adminController.loginAdmin )

adminRouter.post('/:id/logout', adminController.logoutAdmin);

adminRouter.put("/:id", adminController.putAdminId);

export default adminRouter