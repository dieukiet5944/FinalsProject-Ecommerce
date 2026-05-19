import express from 'express'
import orderController from '../controller/orderController'

const ordersRouter = express.Router();

ordersRouter.post("/:id/restock", orderController.postOrder);


export default ordersRouter