import CartModel from "../model/cart.js";
import ProductModel from "../model/products.js";

export const cartController = {
    postCart: async (req, res) => {
         try {
            const { userId, items } = req.body;

            if (!userId) {
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

            for (const item of items) {
                const product = await ProductModel.findById(item.productId);
                if (!product) {
                    return res.status(404).json({
                        success: false,
                        message: `The product with ID ${item.productId} does not exist.`
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
            const { userId } = req.params;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide your user ID"
                });
            }

            const cart = await CartModel.findOne({ customerId: userId });

            if (!cart) {
                return res.status(200).json({
                    success: true,
                    message: "Shopping cart is empty.",
                    data: { customerId: userId, items: [] }
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
}