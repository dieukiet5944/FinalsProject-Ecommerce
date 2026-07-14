import ProductModel from "../model/products.js";
import OrderModel from "../model/order.js";

export const productRepository = {
    find: async (queryCondition) => {
        return await ProductModel.find(queryCondition);
    },

    findOneBySlug: async (slug) => {
        return await ProductModel.findOne({ slug });
    },

    findById: async (id) => {
        return await ProductModel.findById(id);
    },

    findOneByIdCustom: async (id) => {
        return await ProductModel.findOne({ id: id });
    },

    create: async (productData) => {
        const product = new ProductModel(productData);
        return await product.save();
    },

    deleteById: async (id) => {
        return await ProductModel.findByIdAndDelete(id);
    },

    pullBatchById: async (productId, batchId) => {
        return await ProductModel.findByIdAndUpdate(
            productId,
            { $pull: { stockBatches: { _id: batchId } } },
            { new: true }
        );
    },

    isProductInAnyOrder: async (productId) => {
        const order = await OrderModel.findOne({
            items: { $elemMatch: { productId } }
        });
        return !!order;
    }
};