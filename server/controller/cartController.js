import CartModel from "../model/cart.js";
import ProductModel from "../model/products.js";

export const cartController = {
    postCart: async (req, res) => {
         try {
            const { userId, items } = req.body;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng cung cấp userId"
                });
            }

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng cung cấp danh sách items (productId, quantity)"
                });
            }

            for (const item of items) {
                const product = await ProductModel.findById(item.productId);
                if (!product) {
                    return res.status(404).json({
                        success: false,
                        message: `Sản phẩm với ID ${item.productId} không tồn tại`
                    });
                }
            }

            let cart = await CartModel.findOne({ userId: userId });

            if (!cart) {
                cart = new CartModel({
                    userId: userId,
                    items: items
                });
            } else {
                items.forEach(newItem => {
                    const existingItem = cart.items.find(
                        i => i.productId.toString() === newItem.productId
                    );

                    if (existingItem) {
                        existingItem.quantity += newItem.quantity;
                    } else {
                        cart.items.push({
                            productId: newItem.productId,
                            quantity: newItem.quantity
                        });
                    }
                });
            }

            await cart.save();

            return res.status(200).json({
                success: true,
                message: "Thêm sản phẩm vào giỏ hàng thành công",
                data: cart
            });

        } catch (error) {
            console.error("Lỗi tại addToCart Controller:", error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    getCart: async (req, res) => {
        try {
            const { userId } = req.params;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng cung cấp userId"
                });
            }

            const cart = await CartModel.findOne({ customerId: userId });

            if (!cart) {
                return res.status(200).json({
                    success: true,
                    message: "Giỏ hàng trống",
                    data: { customerId: userId, items: [] }
                });
            }

            return res.status(200).json({
                success: true,
                message: "Lấy giỏ hàng thành công",
                data: cart
            });

        } catch (error) {
            console.error("Lỗi tại getCart Controller:", error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
}