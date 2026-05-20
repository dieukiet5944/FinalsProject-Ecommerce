import express from 'express'
import productController from '../controller/productController.js'

const productRouter = express.Router();

productRouter.get("/", productController.getProducts);

productRouter.get("/:id", productController.getProductId);

productRouter.post("/", productController.postCreateProduct);

productRouter.put("/:id", productController.putRestockProduct);

productRouter.put("/:id", productController.putProductDetails);

export default productRouter