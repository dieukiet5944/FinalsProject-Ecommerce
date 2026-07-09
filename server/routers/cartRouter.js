import Router from 'express';
import { cartController } from '../controller/cartController.js';

const cartRouter = Router();

cartRouter.post("/:customerId", cartController.postCart);

cartRouter.get("/:customerId", cartController.getCart);

cartRouter.delete("/:customerId/:productId", cartController.deleteCartItem)

export default cartRouter;