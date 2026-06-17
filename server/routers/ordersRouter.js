import express from 'express'
import orderController from '../controller/orderController.js'

const ordersRouter = express.Router();

ordersRouter.get("/", orderController.getOrders);

ordersRouter.post("/", orderController.postOrder);

ordersRouter.put("/:id", orderController.putUpdateOrder);

ordersRouter.put("/changestate/:id", orderController.putUpdateStateOrder)

ordersRouter.delete("/:id", orderController.deleteOrder);


export default ordersRouter;
