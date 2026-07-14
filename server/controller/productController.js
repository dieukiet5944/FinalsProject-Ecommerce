import { productService } from "../service/productService.js";
import { catchAsync } from "../utils/catchAsync.js";

const productController = {
    getProducts: catchAsync( async (req, res) => {
            const { role } = req.query;
            const products = await productService.getProducts(role);

            return res.status(200).send({
                success: true,
                message: "Successful get Data Products",
                data: products
            });
    }),

    getProductBySlug: catchAsync( async (req, res) => {
            const { slug } = req.params;

            if (!slug || slug === 'undefined') {
                return res.status(400).json({ success: false, message: "Slug không hợp lệ" });
            }

            const product = await productService.getProductBySlug(slug);

            return res.status(200).json({
                success: true,
                message: "Successful get data Pro'slug",
                data: product
            });
    }),

    getProductId: catchAsync( async (req, res) => {
            const { id } = req.params;
            const product = await productService.getProductById(id);

            return res.status(200).send({
                success: true,
                message: "Successful get data Pro'id",
                data: product
            });
    }),

    postUploadCloud: catchAsync( async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ message: 'No files were uploaded!' });
        }
        return res.status(200).json({
            message: 'Upload successful!',
            fileUrl: req.file.path
        });
    }),

    postCreateProduct: catchAsync( async (req, res) => {
            const { name, price, category, image, quantity, expiredAt, slug } = req.body;

            if (!name || price === undefined || !category || !image || quantity === undefined || !expiredAt || !slug) {
                return res.status(400).send({
                    success: false,
                    message: "Please fill in all required information: Name, Price, Category, Image, Stock Quantity, Expired At, Status, and Slug."
                });
            }

            const newProduct = await productService.createProduct({
                name, price, category, image, quantity, expiredAt, slug
            });

            return res.status(201).send({
                success: true,
                message: `New product "${name}" added successfully!`,
                data: newProduct
            });
    }),

    putProductDetails: catchAsync( async (req, res) => {
            const { id } = req.params;
            const { name, price, category, image, status, quantity, expiredAt, slug } = req.body;

            const { product, totalQuantity } = await productService.updateProductDetails(id, {
                name, price, category, image, status, quantity, expiredAt, slug
            });

            return res.status(200).send({
                success: true,
                message: `Product "${product.name}" has been successfully received into inventory!`,
                data: {
                    ...product,
                    quantity: totalQuantity
                }
            });
    }),

    deleteProduct: catchAsync( async (req, res) => {
            const { id } = req.params;
            const deletedProduct = await productService.deleteProduct(id);

            return res.status(200).send({
                success: true,
                message: `The product "${deletedProduct.name}" has been successfully removed from the system.`
            });
    }),

    deleteExpiredBatch: catchAsync( async (req, res) => {
            const { productId, batchId } = req.params;
            const { product, totalQuantity } = await productService.deleteExpiredBatch(productId, batchId);

            return res.status(200).send({
                success: true,
                message: "The expired shipment has been successfully cancelled!",
                data: {
                    ...product,
                    quantity: totalQuantity
                }
            });
    })
};

export default productController;