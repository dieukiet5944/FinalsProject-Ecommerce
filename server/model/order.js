import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    productId: { 
        type: String, 
        required: true 
    }, 
    name: { 
        type: String, 
        required: true },      
    qty: { 
        type: Number, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    }      
}, { _id: false });

const orderSchema = new mongoose.Schema({
    id: { 
        type: String, 
        required: true, 
        unique: true 
    },
    customerId: { 
        type: String, 
        required: true 
    },
    date: {
        type: String,
        required: true
    },
    items: [orderItemSchema], 
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