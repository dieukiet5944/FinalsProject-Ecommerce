import mongoose from 'mongoose';
import { productRepository } from "../repositories/productRepository.js";

const culateAndGetStatus = (totalQuantity, explicitStatus) => {
    if (explicitStatus) return explicitStatus;
    if (totalQuantity === 0) return "OUT OF STOCK";
    if (totalQuantity <= 20) return "LOW STOCK";
    return "IN STOCK";
};

export const productService = {
    getProducts: async (role) => {
        let queryCondition = {};
        if (role === "user") {
            queryCondition.status = { $in: ["IN STOCK", "LOW STOCK"] };
        }

        const products = await productRepository.find(queryCondition);
        if (!products || products.length === 0) {
            throw new Error("Products list is empty");
        }
        return products;
    },

    getProductBySlug: async (slug) => {
        const product = await productRepository.findOneBySlug(slug);
        if (!product) {
            throw new Error("Product not found");
        }
        return product;
    },

    getProductById: async (id) => {
        let product = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
            product = await productRepository.findById(id);
        }
        if (!product) {
            product = await productRepository.findOneByIdCustom(id);
        }
        if (!product) {
            throw new Error("This id is not valid or disconnected");
        }
        return product;
    },

    createProduct: async ({ name, price, category, image, quantity, expiredAt, slug }) => {
        if (!["CAKE", "DRINK"].includes(category)) {
            throw new Error("Invalid product category. Only 'CAKE' or 'DRINK' will be accepted.");
        }

        const productQuantity = parseInt(quantity);
        const productPrice = parseFloat(price);

        if (productQuantity > 100) {
            throw new Error("The number of products created must not exceed 100!");
        }

        const finalStatus = culateAndGetStatus(productQuantity);

        return await productRepository.create({
            name,
            price: productPrice,
            category,
            image,
            stockBatches: [{
                quantity: productQuantity,
                expiredAt: new Date(expiredAt)
            }],
            status: finalStatus,
            slug
        });
    },

    updateProductDetails: async (id, updateData) => {
        const product = await productRepository.findById(id);
        if (!product) {
            throw new Error("No products were found matching this ID.");
        }

        if (updateData.name) product.name = updateData.name;
        if (updateData.price !== undefined) product.price = parseFloat(updateData.price);
        if (updateData.category) product.category = updateData.category;
        if (updateData.image) product.image = updateData.image;
        if (updateData.status) product.status = updateData.status;
        if (updateData.slug) product.slug = updateData.slug;
        
        if (updateData.quantity && updateData.expiredAt) {
            if (!product.stockBatches || !Array.isArray(product.stockBatches)) {
                product.stockBatches = [];
            }

            product.stockBatches.push({
                quantity: parseInt(updateData.quantity),
                expiredAt: new Date(updateData.expiredAt)
            });
        }

        const totalQuantity = product.stockBatches.reduce((total, batch) => total + (batch.quantity || 0), 0);

        if (totalQuantity > 100) {
            throw new Error("Exceeded warehouse capacity (Maximum 100)!");
        }

        if (!updateData.status) {
            product.status = culateAndGetStatus(totalQuantity);
        }

        await product.save({ runValidators: true });
        
        return {
            product: product.toObject(),
            totalQuantity
        };
    },

    deleteProduct: async (id) => {
        const product = await productRepository.findById(id);
        if (!product) {
            throw new Error("This product could not be found on the system.");
        }

        const isProductInOrder = await productRepository.isProductInAnyOrder(id);

        if (isProductInOrder) {
            throw new Error(`The product "${product.name}" cannot be deleted because it already exists in the system's order history. You should update the quantity to 0 (OUT OF STOCK) instead of deleting it.`);
        }

        await productRepository.deleteById(id);
        return product;
    },

    deleteExpiredBatch: async (productId, batchId) => {
        const product = await productRepository.pullBatchById(productId, batchId)

        if (!product) {
            throw new Error("No product found.");
        }

        const totalQuantity = product.stockBatches.reduce((total, batch) => total + batch.quantity, 0);
        product.status = culateAndGetStatus(totalQuantity);
        
        await product.save();

        return {
            product: product.toObject(),
            totalQuantity
        };
    }
};