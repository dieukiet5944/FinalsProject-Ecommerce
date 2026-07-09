import OrderModel from "../model/order.js";

export const handleSepayWebhook = async (req, res) => {
    try {
        const { code, content, transferAmount } = req.body; 
       
        const orderId = content.replace("CRUMB_", "").trim();
        
        const order = await OrderModel.findById(orderId);
        if (order && order.paymentStatus === 'unpaid') {
            order.paymentStatus = 'paid'; 
            order.status = 'Processing';  
            await order.save();
        }
        
        return res.status(200).json({ success: true, message: "Webhook processed successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};