import Router from 'express';
import { cartController } from '../controller/cartController.js';

const cartRouter = Router();

cartRouter.post("/add", cartController.postCart);

cartRouter.get("/:userId", cartController.getCart);

export default cartRouter;