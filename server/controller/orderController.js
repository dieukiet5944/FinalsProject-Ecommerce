import OrderModel from "../model/order.js";
import ProductModel from "../model/products.js";
import crypto from 'crypto'

const orderController = {
    getOrders: async (req, res) => {
        try {
            const response = await OrderModel.find({}).sort({ createdAt: -1 });

            if (!response || response.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: "No orders found",
                    data: []
                });
            }

            return res.status(200).json({
                success: true,
                message: "GET list of orders successful",
                data: response
            });

        } catch (error) {
            console.error("Lỗi tại getOrders Controller:", error);
            return res.status(500).json({
                success: false,
                message: error.message,
                data: null
            });
        }
    },

    postOrder: async (req, res) => {
        try {
            const { customerId, items } = req.body;

            if (!customerId || !items || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng cung cấp customerId và danh sách sản phẩm (items)."
                });
            }

            let totalPrice = 0;
            const confirmedItems = [];
            const productsToSave = [];

            for (const item of items) {
                const product = await ProductModel.findById(item.productId);

                if (!product) {
                    return res.status(404).json({
                        success: false,
                        message: `Sản phẩm với ID ${item.productId} không tồn tại trên hệ thống.`
                    });
                }

                if (product.status === "OUT OF STOCK" || product.quantity < item.qty) {
                    return res.status(400).json({
                        success: false,
                        message: `Sản phẩm "${product.name}" đã hết hàng hoặc không đủ số lượng để cung cấp. (Hiện còn: ${product.quantity})`
                    });
                }

                const currentPrice = Number(product.price) || 0;
                totalPrice += currentPrice * item.qty;

                confirmedItems.push({
                    productId: product._id,
                    name: product.name,
                    qty: item.qty,
                    price: currentPrice
                });

                product.quantity -= item.qty;

                if (product.quantity === 0) {
                    product.status = "OUT OF STOCK";
                } else if (product.quantity <= 5) {
                    product.status = "LOW STOCK";
                } else {
                    product.status = "IN STOCK";
                }

                productsToSave.push(product);
            }

            await Promise.all(productsToSave.map(p => p.save()));

            const newOrder = new OrderModel({
                customerId,
                items: confirmedItems,
                totalPrice,
                status: "Completed"
            });

            await newOrder.save();

            res.status(201).json({
                success: true,
                message: "Đặt hàng thành công! Kho đã được cập nhật và đồng bộ trạng thái.",
                data: newOrder
            });

        } catch (error) {
            console.log("Loi server khi tao order:", error.message);
            res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: error.message
            });
        }
    },

    putUpdateOrder: async (req, res) => {
        try {
            const { orderId } = req.params;

            const {
                status,
                items,
            } = req.body;

            const order = await OrderModel.findById(orderId);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy đơn hàng với ID này trên hệ thống."
                });
            }

            if (status) {
                if (!["Pending", "Processing", "Completed", "Canceled"].includes(status)) {
                    return res.status(400).json({
                        success: false,
                        message: "Trạng thái đơn hàng không hợp lệ! Chỉ chấp nhận Pending, Processing, Completed hoặc Canceled."
                    });
                }
                order.status = status;
            }

            if (items && Array.isArray(items)) {
                order.items = items;
                let newTotal = 0;
                for (const item of items) {
                    newTotal += (item.qty || 0) * (item.price || 0);
                }
                order.totalPrice = newTotal;
            }

            await order.save({ runValidators: true });

            res.status(200).json({
                success: true,
                message: `Cập nhật thông tin đơn hàng thành công!`,
                data: order
            });

        } catch (error) {
            console.log("Loi server khi cap nhat thong tin don hang:", error.message);
            res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: error.message
            });
        }
    },

    deleteOrder: async (req, res) => {
        try {
            const { id } = req.params;

            const order = await OrderModel.findByIdAndDelete(id);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy đơn hàng với ID này trên hệ thống."
                });
            }

            res.status(200).json({
                success: true,
                message: "Xóa đơn hàng thành công!",
                data: order
            });

        } catch (error) {
            console.log("Loi server khi xoa don hang:", error.message);
            res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: error.message
            });
        }
    }
}

export default orderController;
