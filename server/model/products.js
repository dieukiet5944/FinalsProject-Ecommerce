import mongoose from 'mongoose'
import { type } from 'os';


const productSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ["CAKE", "DRINK"]
    },
    image: {
        type: String,
        required: true
    },
    stock: {
        capacity: { 
            type: Number, 
            required: true 
        },
        currentstock: { 
            type: Number, 
            required: true, 
            default: 0 
        }
    },
    createdAt: {
        type: String,
        required: true
    },
    expiryDate: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["IN STOCK","LOW STOCK", "OUT OF STOCK"],
        default: "IN STOCK"
    }
}, {
    timestamps: true
});

const ProductModel = mongoose.model("products", productSchema);

export default ProductModel;