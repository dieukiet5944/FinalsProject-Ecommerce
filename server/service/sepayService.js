import { orderRepository } from "../repositories/orderRepository.js";

export const sepayService = {

    processWebhook: async ({ code, content, transferAmount }) => {
        if (!content) {
            throw new Error("Transaction content is missing");
        }

        const orderId = content.replace("CRUMB_", "").trim();

        const order = await orderRepository.findById(orderId);
        
        if (!order) {
            throw new Error("Order not found");
        }

        if (order.paymentStatus === 'unpaid') {

            await orderRepository.updatePaymentSuccess(order);
            
            return { updated: true, order };
        }

        return { updated: false, order };
    }
};