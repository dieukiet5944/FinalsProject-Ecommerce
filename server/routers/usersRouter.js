import express from 'express'
import userControllers from '../controller/userController.js'
import { checkloginUser } from '../middleware/checkLoginuser.js';

const usersRouter = express.Router();

usersRouter.get("/", userControllers.getUsers);

usersRouter.get("/:id", userControllers.getUsersId);

usersRouter.put("/:id", userControllers.putUsersId);

usersRouter.post("/register", userControllers.resgisterUser);

usersRouter.post("/login", checkloginUser, userControllers.loginUser)

usersRouter.post('/:id/logout', userControllers.logout);

usersRouter.delete("/:id", userControllers.deleteUser);

export default usersRouter