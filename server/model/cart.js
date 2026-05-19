import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    customerId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    items: [
        {
            productId: { type: String, required: true },
            quantity: { type: Number, required: true, default: 1 }
        }
    ]
}, { 
    timestamps: true 
});

const CartModel = mongoose.model('Cart', cartSchema);

export default CartModel;