import CartModel from "../model/cart.js";
import ProductModel from "../model/products.js";

export const cartRepository = {
    findProductsByIds: async (productIds) => {
        return await ProductModel.find({ _id: { $in: productIds } });
    },

    findByCustomerId: async (customerId) => {
        return await CartModel.findOne({ customerId });
    },

    findByCustomerIdWithPopulate: async (customerId) => {
        return await CartModel.findOne({ customerId }).populate('items.productId');
    },

    createCart: async (cartData) => {
        const cart = new CartModel(cartData);
        return await cart.save();
    },

    removeItem: async (customerId, productId) => {
        return await CartModel.findOneAndUpdate(
            { customerId: customerId },
            { $pull: { items: { productId: productId } } },
            { new: true }
        ).populate('items.productId');
    }
};