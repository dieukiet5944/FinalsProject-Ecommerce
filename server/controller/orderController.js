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

            // 1. Kiểm tra đầu vào cơ bản
            if (!customerId || !items || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng cung cấp customerId và danh sách sản phẩm (items)."
                });
            }

            let totalPrice = 0;
            const confirmedItems = [];

            // 2. Duyệt qua mảng items để kiểm tra kho, tính tiền và trừ kho
            for (const item of items) {
                // Tìm sản phẩm dựa trên trường _id trong MongoDB
                const product = await ProductModel.findById(item.productId);

                if (!product) {
                    return res.status(404).json({
                        success: false,
                        message: `Sản phẩm với ID ${item.productId} không tồn tại trên hệ thống.`
                    });
                }

                // Kiểm tra trạng thái hoặc số lượng tồn kho thực tế
                if (product.status === "OUT OF STOCK" || product.quantity < item.qty) {
                    return res.status(400).json({
                        success: false,
                        message: `Sản phẩm "${product.name}" đã hết hàng hoặc không đủ số lượng để cung cấp. (Hiện còn: ${product.quantity})`
                    });
                }

                // Tính toán tổng tiền dựa trên giá gốc từ database nhằm bảo mật
                totalPrice += product.price * item.qty;

                // Đẩy phần tử vào mảng khớp hoàn toàn orderItemSchema
                confirmedItems.push({
                    productId: product._id.toString(),
                    name: product.name,
                    qty: item.qty,
                    price: product.price
                });

                // 3. Tiến hành trừ số lượng trong quantity
                product.quantity -= item.qty;

                // TỰ ĐỘNG CẬP NHẬT TRẠNG THÁI SẢN PHẨM (PRODUCT STATUS)
                if (product.quantity === 0) {
                    product.status = "OUT OF STOCK";
                } else if (product.quantity <= 5) {
                    product.status = "LOW STOCK";
                } else {
                    product.status = "IN STOCK";
                }

                // Lưu sản phẩm đã cập nhật kho và trạng thái vào DB
                await product.save();
            }

            // 4. Tạo mã đơn hàng ngẫu nhiên duy nhất
            const orderId = "ORD-" + crypto.randomBytes(4).toString("hex").toUpperCase();

            // 5. Tạo thực thể Order mới
            const newOrder = new OrderModel({
                customerId,
                items: confirmedItems,
                totalPrice,
                status: "Pending"
            });

            // 6. Lưu đơn hàng thành công
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

            // Bóc tách tất cả các trường có thể thay đổi của một đơn hàng từ Client gửi lên
            const {
                status,
                items,
            } = req.body;

            // 1. Tìm đơn hàng hiện tại trong Database dựa trên _id
            const order = await OrderModel.findById(orderId);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy đơn hàng với ID này trên hệ thống."
                });
            }

            // 2. Kiểm tra và cập nhật TRẠNG THÁI (Nếu client có gửi lên)
            if (status) {
                if (!["Pending", "Processing", "Completed", "Canceled"].includes(status)) {
                    return res.status(400).json({
                        success: false,
                        message: "Trạng thái đơn hàng không hợp lệ! Chỉ chấp nhận Pending, Processing, Completed hoặc Canceled."
                    });
                }
                order.status = status;
            }

            // 3. Kiểm tra và cập nhật DANH SÁCH MÓN ĂN/SỐ LƯỢNG (Nếu sửa giỏ hàng trong đơn)
            if (items && Array.isArray(items)) {
                order.items = items;
                // Tính lại totalPrice nếu cần
                let newTotal = 0;
                for (const item of items) {
                    newTotal += (item.qty || 0) * (item.price || 0);
                }
                order.totalPrice = newTotal;
            }

            // 4. Lưu toàn bộ thay đổi vào MongoDB Atlas
            await order.save({ runValidators: true });

            // 5. Phản hồi cục dữ liệu mới tinh vừa cập nhật xong về cho Client hiển thị
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

            // 1. Tìm đơn hàng trong Database và xóa
            const order = await OrderModel.findByIdAndDelete(id);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy đơn hàng với ID này trên hệ thống."
                });
            }

            // 2. Xóa thành công
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
