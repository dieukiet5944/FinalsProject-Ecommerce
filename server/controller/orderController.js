import { orderService } from "../service/orderService.js";
import { catchAsync } from "../utils/catchAsync.js";

const orderController = {
    getOrders: catchAsync( async (req, res) => {
            const { customerId } = req.params;
            const pageNumber = Number(req.query.pageNumber) || 1;
            const pageSize = Number(req.query.pageSize) || 3;

            const { orders, totalItems, totalPages } = await orderService.getOrdersByCustomer(
                customerId, 
                pageNumber, 
                pageSize
            );

            if (orders.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: "No orders found for this user",
                    data: [],
                    totalItems: 0,
                    totalPages: 0,
                    pageNumber,
                    pageSize
                });
            }

            return res.status(200).json({
                success: true,
                message: "User orders fetched successfully",
                data: orders,
                totalItems,
                totalPages,
                pageNumber,
                pageSize
            });
    }),

    getOrdersForAdmin: catchAsync( async (req, res) => {
            const response = await orderService.getAllOrdersForAdmin();

            return res.status(200).json({
                success: true,
                message: "Admin: GET all orders successful",
                data: response, 
                totalItems: response.length
            });
    }),

    postOrder: catchAsync( async (req, res) => {
            const { customerId, items, promotion } = req.body;

            if (!customerId || !items || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide the customer ID and a list of products (items)."
                });
            }

            const newOrder = await orderService.createOrder({ customerId, items, promotion });

            return res.status(201).json({
                success: true,
                message: "Order successful! Inventory has been updated and status synchronized.",
                data: newOrder
            });
    }),

    putUpdateOrder: catchAsync( async (req, res) => {
            const { id } = req.params;
            const { status, items } = req.body;

            const updatedOrder = await orderService.updateOrderDetails(id, { status, items });

            return res.status(200).json({
                success: true,
                message: "Order information successfully updated!",
                data: updatedOrder
            });
    }),

    putUpdateStateOrder: catchAsync( async (req, res) => {
            const { id } = req.params;

            const completedOrder = await orderService.completeOrder(id);

            return res.status(200).json({
                success: true,
                message: "Order accepted!",
                data: completedOrder
            });
    }),

    deleteOrder: catchAsync( async (req, res) => {
            const { id } = req.params;

            const deletedOrder = await orderService.deleteOrder(id);

            return res.status(200).json({
                success: true,
                message: "Order deleted successfully!",
                data: deletedOrder
            });
    })
};

export default orderController;