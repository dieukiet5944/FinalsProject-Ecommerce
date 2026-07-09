import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
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
    customerId: {
        type: String,
        required: true
    },
    items: {
        type: [orderItemSchema],
        required: true,
        default: []
    },
    promotion: {
        code: {
            type: String,
            default: null
        },
        discountAmount: {
            type: Number,
            default: 0
        }
    },
    subTotalPrice: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'bank'],
        default: 'cod'
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'refunded'],
        default: 'unpaid'
    },
    status: {
        type: String,
        enum: ["Pending", "Completed", "Canceled"],
        default: "Pending"
    },
}, {
    timestamps: true
});

const OrderModel = mongoose.model("orders", orderSchema);

export default OrderModel;