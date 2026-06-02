import express from 'express';
import adminController from '../controller/adminController.js';
import { checkloginAD } from '../middleware/checkLoginadmin.js';

const adminRouter = express.Router();

adminRouter.get("/", adminController.getAdmin);

adminRouter.post("/register", adminController.registerAdmin );

adminRouter.post("/login", checkloginAD, adminController.loginAdmin )

export default adminRouter