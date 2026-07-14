import { cartService } from "../service/cartService.js";
import { catchAsync } from "../utils/catchAsync.js";

export const cartController = {
    postCart: catchAsync( async (req, res) => {
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

            const updatedCart = await cartService.addToCart(customerId, items);

            return res.status(200).json({
                success: true,
                message: "Product added to cart successfully.",
                data: updatedCart
            });
    }),

    getCart: catchAsync( async (req, res) => {
            const { customerId } = req.params;

            if (!customerId) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide your user ID"
                });
            }

            const cart = await cartService.getCartByCustomer(customerId);

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
    }),

    deleteCartItem: catchAsync( async (req, res) => {
            const { customerId, productId } = req.params;

            if (!customerId || !productId) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide both customerId and productId."
                });
            }

            const updatedCart = await cartService.removeItemFromCart(customerId, productId);

            return res.status(200).json({
                success: true,
                message: "Item removed from cart successfully.",
                data: updatedCart
            });
    })
};