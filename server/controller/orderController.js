import OrderModel from "../model/order.js";
import crypto from 'crypto'

const orderController = {
    getOrders: async (req, res) => {
        try {
            const response = await OrderModel.find({});

            if (!response || response.length === 0) {
                return res.status(404).send({
                    success: false,
                    message: "The list of orders is empty!!"
                });
            }

            return res.status(200).send({
                success: true,
                message: "GET list of orders successful",
                data: response
            });

        } catch (error) {
            console.error("Lỗi tại getOrders Controller:", error);
            return res.status(500).send({
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
                return res.status(400).send({
                    success: false,
                    message: "Vui lòng cung cấp customerId và danh sách sản phẩm (items)."
                });
            }

            let totalPrice = 0;
            const confirmedItems = [];

            // 2. Duyệt qua mảng items để kiểm tra kho, tính tiền và trừ kho
            for (const item of items) {
                // Tìm sản phẩm dựa trên trường id (String) trong schema Product của bạn
                const product = await ProductModel.findOne({ id: item.productId });

                if (!product) {
                    return res.status(404).send({
                        success: false,
                        message: `Sản phẩm với ID ${item.productId} không tồn tại trên hệ thống.`
                    });
                }

                // Kiểm tra trạng thái hoặc số lượng tồn kho thực tế
                if (product.status === "OUT OF STOCK" || product.stock.currentstock < item.qty) {
                    return res.status(400).send({
                        success: false,
                        message: `Sản phẩm "${product.name}" đã hết hàng hoặc không đủ số lượng để cung cấp. (Hiện còn: ${product.stock.currentstock})`
                    });
                }

                // Tính toán tổng tiền dựa trên giá gốc từ database nhằm bảo mật
                totalPrice += product.price * item.qty;

                // Đẩy phần tử vào mảng khớp hoàn toàn khuôn orderItemSchema của bạn
                confirmedItems.push({
                    productId: product.id,
                    name: product.name,
                    qty: item.qty,
                    price: product.price
                });

                // 3. Tiến hành trừ số lượng trong currentstock
                product.stock.currentstock -= item.qty;

                // TỰ ĐỘNG CẬP NHẬT TRẠNG THÁI SẢN PHẨM (PRODUCT STATUS)
                if (product.stock.currentstock === 0) {
                    product.status = "OUT OF STOCK";
                } else if (product.stock.currentstock <= 5) {
                    // Bạn có thể sửa số 5 này thành ngưỡng "LOW STOCK" tùy ý bạn
                    product.status = "LOW STOCK";
                } else {
                    product.status = "IN STOCK";
                }

                // Lưu sản phẩm đã cập nhật kho và trạng thái vào DB
                await product.save();
            }

            // 4. Tạo mã đơn hàng ngẫu nhiên duy nhất cho trường id (String)
            const orderId = "ORD-" + crypto.randomBytes(4).toString("hex").toUpperCase();

            // 5. Tạo chuỗi ngày tháng cho trường date (String) 
            // Định dạng ra chuỗi dạng: "2026-05-18 18:30:00" cho dễ đọc
            const orderDate = new Date().toISOString().replace('T', ' ').substring(0, 19);

            // 6. Tạo thực thể Order mới theo schema của bạn
            const newOrder = new Order({
                id: orderId,
                customerId,
                date: orderDate,
                items: confirmedItems,
                totalPrice,
                status: "Pending" // Mặc định theo enum của bạn
            });

            // 7. Lưu đơn hàng thành công
            await newOrder.save();

            res.status(201).send({
                success: true,
                message: "Đặt hàng thành công! Đ kho đã được cập nhật và đồng bộ trạng thái.",
                data: newOrder
            });

        } catch (error) {
            console.log("Loi server khi tao order:", error.message);
            res.status(500).send({
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

            // 1. Tìm đơn hàng hiện tại trong Database dựa trên mã id (String)
            const order = await OrderModel.findOne({ id: orderId });
            if (!order) {
                return res.status(404).send({
                    success: false,
                    message: "Không tìm thấy đơn hàng với mã ID này trên hệ thống."
                });
            }

            // 2. Kiểm tra và cập nhật TRẠNG THÁI (Nếu client có gửi lên)
            if (status) {
                if (!["Pending", "Completed", "Canceled"].includes(status)) {
                    return res.status(400).send({
                        success: false,
                        message: "Trạng thái đơn hàng không hợp lệ! Chỉ chấp nhận Pending, Completed hoặc Canceled."
                    });
                }
                order.status = status;
            }

            // 3. Kiểm tra và cập nhật DANH SÁCH MÓN ĂN/SỐ LƯỢNG (Nếu sửa giỏ hàng trong đơn)
            if (items && Array.isArray(items)) {
                // Bạn có thể viết thêm logic tính toán lại totalPrice tại đây nếu cần thiết
                order.items = items;
            }

            // 5. Lưu toàn bộ thay đổi vào MongoDB Atlas
            // { runValidators: true } giúp ép Schema chạy lại bộ kiểm tra dữ liệu đầu vào
            await order.save({ runValidators: true });

            // 6. Phản hồi cục dữ liệu mới tinh vừa cập nhật xong về cho Client hiển thị
            res.status(200).send({
                success: true,
                message: `Cập nhật thông tin đơn hàng ${orderId} thành công!`,
                data: order
            });

        } catch (error) {
            console.log("Loi server khi cap nhat thong tin don hang:", error.message);
            res.status(500).send({
                success: false,
                message: "Internal Server Error",
                error: error.message
            });
        }
    }
}

export default orderController