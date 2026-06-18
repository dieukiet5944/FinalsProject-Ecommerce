import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    productId: { 
        type: String, 
        required: true 
    },
    quantity: { 
        type: Number, 
        required: true, 
        default: 1 
    }
}, { _id: false });

const cartSchema = new mongoose.Schema({
    customerId: {
        type: String,
        required: true,
        unique: true
    },
    items: [cartItemSchema]
}, {
    timestamps: true
});

const CartModel = mongoose.model('Cart', cartSchema);

export default CartModel;