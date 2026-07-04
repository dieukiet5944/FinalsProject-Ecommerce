import mongoose from 'mongoose';

const StockBatchSchema = new mongoose.Schema({
    quantity: { 
        type: Number, 
        required: true,
        min: 0
    },
    expiredAt: { 
        type: Date, 
        required: [true, 'The date is required !!! '] 
    }
}, { 
    timestamps: { createdAt: true, updatedAt: false } 
});

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
        enum: ["CAKE", "DRINK"] },
    image: { 
        type: String, 
        required: true },
    status: { 
        type: String, 
        enum: ["IN STOCK", "LOW STOCK", "OUT OF STOCK"], 
        default: "OUT OF STOCK" 
    },
    slug: { 
        type: String, 
        required: true,
        unique: true
    },
    stockBatches: [StockBatchSchema]
}, {
    timestamps: true
});

const ProductModel = mongoose.model("products", productSchema);

export default ProductModel;