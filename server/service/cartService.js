import { cartRepository } from "../repositories/cartRepository.js";

export const cartService = {
    addToCart: async (customerId, items) => {
        const productIds = items.map(item => item.productId);
        const existingProducts = await cartRepository.findProductsByIds(productIds);

        if (existingProducts.length !== productIds.length) {
            throw new Error("One or more products in your list do not exist.");
        }

        let cart = await cartRepository.findByCustomerId(customerId);

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

            await cart.save();
        }

        
        await cart.populate('items.productId');
        return cart;
    },

    getCartByCustomer: async (customerId) => {
        return await cartRepository.findByCustomerIdWithPopulate(customerId);
    },

    removeItemFromCart: async (customerId, productId) => {
        const updatedCart = await cartRepository.removeItem(customerId, productId);

        if (!updatedCart) {
            throw new Error("Shopping cart not found for this user.");
        }

        return updatedCart;
    }
};