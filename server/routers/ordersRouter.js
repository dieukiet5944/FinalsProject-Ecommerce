import express from 'express'
import orderController from '../controller/orderController.js'

const ordersRouter = express.Router();

// GET all orders
ordersRouter.get("/", orderController.getOrders);

// POST create new order
ordersRouter.post("/", orderController.postOrder);

// PUT update order by ID
ordersRouter.put("/:id", orderController.putUpdateOrder);

// DELETE order by ID
ordersRouter.delete("/:id", orderController.deleteOrder);

export default ordersRouter;
