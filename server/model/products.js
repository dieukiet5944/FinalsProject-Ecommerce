import mongoose from 'mongoose';


const productSchema = new mongoose.Schema({
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
    quantity: {
        type: Number,
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