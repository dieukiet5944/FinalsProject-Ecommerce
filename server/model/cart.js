import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'products', 
        required: [true, 'ID product is reuired!'] 
    },
    quantity: { 
        type: Number, 
        required: [true, 'Số lượng là bắt buộc'], 
        min: [1, 'Số lượng không được nhỏ hơn 1'],
        default: 1 
    }
}, { _id: false });

const cartSchema = new mongoose.Schema({
    customerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users',
        required: [true, 'ID User is required !'], 
        unique: true 
    },
    items: [cartItemSchema]
}, { 
    timestamps: true 
});

const CartModel = mongoose.model('cart', cartSchema, 'cart');

export default CartModel;