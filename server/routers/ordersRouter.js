import express from 'express'
import orderController from '../controller/orderController.js'

const ordersRouter = express.Router();

ordersRouter.get("/", orderController.getOrders);

ordersRouter.post("/:id/restock", orderController.postOrder);

ordersRouter.put("/:id", orderController.putUpdateOrder)


export default ordersRouter