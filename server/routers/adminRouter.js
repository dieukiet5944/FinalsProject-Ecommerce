import express from 'express';
import adminController from '../controller/adminController.js';

const adminRouter = express.Router();

adminRouter.get("/", adminController.getAdmin);

export default adminRouter