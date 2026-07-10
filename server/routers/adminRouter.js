import express from 'express';
import adminController from '../controller/adminController.js';
import { checkloginAD } from '../middleware/checkLoginadmin.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const adminRouter = express.Router();

adminRouter.get("/:id", adminController.getAdmin);

adminRouter.post("/register", authLimiter, adminController.registerAdmin );

adminRouter.post("/login", authLimiter, checkloginAD, adminController.loginAdmin )

adminRouter.post('/:id/logout', adminController.logoutAdmin);

adminRouter.put("/:id", adminController.putAdminId);

export default adminRouter