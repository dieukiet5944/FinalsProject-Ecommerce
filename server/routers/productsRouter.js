import express from 'express'
import productController from '../controller/productController.js'
import uploadCloud from '../config/cloudinary.config.js';

const productRouter = express.Router();

productRouter.get("/", productController.getProducts);

productRouter.get("/:slug", productController.getProductBySlug);

productRouter.get("/:id", productController.getProductId);

productRouter.post("/upload", uploadCloud.single('image'), productController.postUploadCloud);

productRouter.post("/", productController.postCreateProduct);

productRouter.put("/:id", productController.putProductDetails);

productRouter.delete("/:id", productController.deleteProduct);

productRouter.delete('/expired/:productId/:batchId', productController.deleteExpiredBatch)

export default productRouter
