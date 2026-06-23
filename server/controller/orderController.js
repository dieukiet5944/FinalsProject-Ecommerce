import OrderModel from "../model/order.js";
import ProductModel from "../model/products.js";
import crypto from 'crypto'

const orderController = {
    getOrders: async (req, res) => {
        try {
            const pageNumber = Number(req.query.pageNumber)

            const pageSize = Number(req.query.pageSize)

            const skip = (pageNumber - 1) * pageSize;

            const [response, totalItems] = await Promise.all([
                OrderModel.find()
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(pageSize),

                (await OrderModel.find()).length
            ]);

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
                data: response,
                totalItems,
                totalPages: Math.ceil(totalItems / pageSize),
                pageNumber,
                pageSize
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

                const currentTotalQuantity = product.stockBatches.reduce((sum, batch) => sum + (batch.quantity || 0), 0);

                if (product.status === "OUT OF STOCK" || currentTotalQuantity < item.qty) {
                    return res.status(400).json({
                        success: false,
                        message: `Sản phẩm "${product.name}" đã hết hàng hoặc không đủ số lượng để cung cấp. (Hiện còn tổng : ${currentTotalQuantity})`
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

                product.stockBatches.sort((a, b) => new Date(a.expiredAt) - new Date(b.expiredAt));

                let quantityToDecrease = item.qty;

                for (let i = 0; i < product.stockBatches.length; i++) {
                    if (quantityToDecrease <= 0) break;

                    let batch = product.stockBatches[i];
                    if (batch.quantity <= 0) continue;

                    if (batch.quantity >= quantityToDecrease) {
                        batch.quantity -= quantityToDecrease;
                        quantityToDecrease = 0;
                    } else {
                        quantityToDecrease -= batch.quantity;
                        batch.quantity = 0;
                    }
                }

                product.stockBatches = product.stockBatches.filter(batch => batch.quantity > 0);

                const newTotalQuantity = product.stockBatches.reduce((sum, batch) => sum + (batch.quantity || 0), 0);

                if (newTotalQuantity === 0) {
                    product.status = "OUT OF STOCK";
                } else if (newTotalQuantity <= 20) {
                    product.status = "LOW STOCK";
                } else {
                    product.status = "IN STOCK";
                }

                productsToSave.push(product);
            }

            await Promise.all(productsToSave.map(p => p.save({ runValidators: false })));

            const newOrder = new OrderModel({
                customerId,
                items: confirmedItems,
                totalPrice,
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
                message: error.message
            });
        }
    },

    putUpdateOrder: async (req, res) => {
        try {
            const { id } = req.params;

            const {
                status,
                items,
            } = req.body;

            const order = await OrderModel.findById(id);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy đơn hàng với ID này trên hệ thống."
                });
            }

            if (status) {
                if (!["Pending", "Completed", "Canceled"].includes(status)) {
                    return res.status(400).json({
                        success: false,
                        message: "Trạng thái đơn hàng không hợp lệ! Chỉ chấp nhận Pending3, Completed hoặc Canceled."
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

    putUpdateStateOrder: async (req, res) => {
        try {
            const { id } = req.params

            const order = await OrderModel.findById(id);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy đơn hàng với ID này trên hệ thống."
                });
            }

            order.status = "Completed"

            await order.save({ runValidators: true });

            res.status(200).json({
                success: true,
                message: `Chấp nhận đơn hàng thành công!`,
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
