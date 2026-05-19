import express from 'express'
import userControllers from '../controller/userController'

const usersRouter = express.Router();

usersRouter.get("/", userControllers.getUsers);

usersRouter.get("/:id", userControllers.getUsersId);

usersRouter.put("/:id", userControllers.putUsersId);

export default usersRouter