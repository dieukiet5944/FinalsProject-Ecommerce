import express from 'express'
import userControllers from '../controller/userController.js'
import { checkloginUser } from '../middleware/checkLoginuser.js';
import { checkUpdateUsers } from '../middleware/checkUpdateUsers.js';
import { checkRegisterUser } from '../middleware/checkRegisterUser.js';
import { checkGetUserId } from '../middleware/checkGetUserId.js';
import { checkDeleteUser } from '../middleware/checkDelete.js';
import { uploadAvatarCloud } from '../config/cloudinary.config.js';

const usersRouter = express.Router();

usersRouter.get("/", userControllers.getUsers);

usersRouter.get("/:id", checkGetUserId, userControllers.getUsersId);

usersRouter.put("/:id", checkUpdateUsers, userControllers.putUsersId);

usersRouter.post("/upload-avatar", uploadAvatarCloud.single('image'), userControllers.postUploadAvatar);

usersRouter.post("/register", checkRegisterUser, userControllers.resgisterUser);

usersRouter.post("/login", checkloginUser, userControllers.loginUser)

usersRouter.post('/:id/logout', userControllers.logout);

usersRouter.delete("/:id", checkDeleteUser, userControllers.deleteUser);

export default usersRouter