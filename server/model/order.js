import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    customerId: { 
        type: String, 
        required: true 
    },
    productId: { 
        type: String, 
        required: true 
    },
    qty: { 
        type: Number, 
        required: true 
    },
    totalPrice: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ["Pending","Completed", "Canceled"], 
        default: "Pending" 
    },
}, { 
    timestamps: true 
});

const OrderModel = mongoose.model("orders", orderSchema);

export default OrderModel