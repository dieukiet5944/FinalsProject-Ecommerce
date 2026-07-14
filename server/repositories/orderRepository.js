import OrderModel from "../model/order.js";
import ProductModel from "../model/products.js";
import PromotionModel from "../model/promo.js";
import CartModel from "../model/cart.js";

export const orderRepository = {
    findById: async (id) => {
        return await OrderModel.findById(id);
    },

    updatePaymentSuccess: async (orderInstance) => {
        orderInstance.paymentStatus = 'paid'; 
        orderInstance.status = 'Processing';  
        return await orderInstance.save();
    },

    findCustomerOrders: async (customerId, skip, limit) => {
        return await OrderModel.find({ customerId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    },

    countCustomerOrders: async (customerId) => {
        return await OrderModel.countDocuments({ customerId });
    },

    findAllOrders: async () => {
        return await OrderModel.find().sort({ createdAt: -1 });
    },

    findOrderById: async (id) => {
        return await OrderModel.findById(id);
    },

    createOrder: async (orderData) => {
        const order = new OrderModel(orderData);
        return await order.save();
    },

    deleteOrderById: async (id) => {
        return await OrderModel.findByIdAndDelete(id);
    },

    findProductById: async (id) => {
        return await ProductModel.findById(id);
    },

    findActivePromoByCode: async (code) => {
        return await PromotionModel.findOne({ code: code.toUpperCase(), isActive: true });
    },

    clearCartByCustomerId: async (customerId) => {
        return await CartModel.findOneAndUpdate(
            { customerId },
            { $set: { items: [] } }
        );
    }
};