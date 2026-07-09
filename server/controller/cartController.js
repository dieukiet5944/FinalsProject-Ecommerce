import CartModel from "../model/cart.js";
import ProductModel from "../model/products.js";

export const cartController = {
    postCart: async (req, res) => {
        try {
            const { customerId } = req.params;
            const { items } = req.body;

            if (!customerId) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide your user ID"
                });
            }

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a list of items (product ID, quantity)."
                });
            }

            const productIds = items.map(item => item.productId);
            const existingProducts = await ProductModel.find({ _id: { $in: productIds } });

            if (existingProducts.length !== productIds.length) {
                return res.status(404).json({
                    success: false,
                    message: "One or more products in your list do not exist."
                });
            }

            let cart = await CartModel.findOne({ customerId });

            if (!cart) {
                cart = new CartModel({
                    customerId,
                    items: items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity
                    }))
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

            await cart.populate('items.productId');
            console.log("Dữ liệu giỏ hàng sau khi populate gửi về client:", JSON.stringify(cart.items, null, 2));

            return res.status(200).json({
                success: true,
                message: "Product added to cart successfully.",
                data: cart
            });

        } catch (error) {
            console.error("Error at add To Cart Controller:", error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    getCart: async (req, res) => {
        try {
            const { customerId } = req.params;

            if (!customerId) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide your user ID"
                });
            }

            const cart = await CartModel.findOne({ customerId }).populate('items.productId');

            if (!cart) {
                return res.status(200).json({
                    success: true,
                    message: "Shopping cart is empty.",
                    data: { customerId, items: [] }
                });
            }

            return res.status(200).json({
                success: true,
                message: "Shopping cart successfully retrieved",
                data: cart
            });

        } catch (error) {
            console.error("Error at getCart Controller:", error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    deleteCartItem: async (req, res) => {
        try {
            const { customerId, productId } = req.params;

            if (!customerId || !productId) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide both customerId and productId."
                });
            }

            const updatedCart = await CartModel.findOneAndUpdate(
                { customerId: customerId },
                { $pull: { items: { productId: productId } } },
                { new: true }
            ).populate('items.productId');

            if (!updatedCart) {
                return res.status(404).json({
                    success: false,
                    message: "Shopping cart not found for this user."
                });
            }

            return res.status(200).json({
                success: true,
                message: "Item removed from cart successfully.",
                data: updatedCart
            });

        } catch (error) {
            console.error("Error at deleteCartItem Controller:", error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}