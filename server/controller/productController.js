import mongoose from 'mongoose';
import ProductModel from "../model/products.js";
import OrderModel from "../model/order.js";
import crypto from 'crypto'

const productController = {
    getProducts: async (req, res) => {
        try {

            const { role } = req.query;

            let queryCondition = {};


            if (role === "user") {
                queryCondition.status = { $in: ["IN STOCK", "LOW STOCK"] };
            }

            const response = await ProductModel.find(queryCondition)

            if (!response || response.length === 0) {

                return res.status(404).send({
                    success: false,
                    message: "Products list is empty"
                })
            }

            return res.status(200).send({
                success: true,
                message: "Successful get Data Products",
                data: response
            })

        }
        catch (error) {
            console.log("Error fetching products", error.message)
            res.status(500).send({
                success: false,
                message: "Internal Server Error",
                error: error.message
            })
        }
    },

    getProductId: async (req, res) => {
        try {
            const { id } = req.params

            let response = null;
            if (mongoose.Types.ObjectId.isValid(id)) {
                response = await ProductModel.findById(id);
            }

            if (!response) {
                response = await ProductModel.findOne({ id: id });
            }

            if (!response) {
                return res.status(400).send({
                    success: false,
                    message: "This id is not valid or disconnected"
                })
            }

            res.status(200).send({
                success: true,
                message: "Successful get data Pro'id",
                data: response
            })

        }
        catch (error) {
            console.log("Error fetching products'Id", error.message)
            res.status(500).send({
                success: false,
                message: "Internal Server Error",
                error: error.message
            })
        }                                                                                                                                   
    },

    postCreateProduct: async (req, res) => {
        try {

            const { name, price, category, image, quantity, expiredAt, status } = req.body;


            if (!name || price === undefined || !category || !image || quantity === undefined || !expiredAt) {
                return res.status(400).send({
                    success: false,
                    message: "Please fill in all required information: Name, Price, Category, Image, and Stock Quantity."
                });
            }


            if (!["CAKE", "DRINK"].includes(category)) {
                return res.status(400).send({
                    success: false,
                    message: "Invalid product category. Only 'CAKE' or 'DRINK' will be accepted."
                });
            }


            const productQuantity = parseInt(quantity);
            const productPrice = parseFloat(price);

            if (productQuantity > 100) {
                return res.status(400).send({
                    success: false,
                    message: "The number of products created must not exceed 100!"
                });
            }

            let finalStatus = "IN STOCK";
            if (productQuantity === 0) {
                finalStatus = "OUT OF STOCK";
            } else if (productQuantity <= 20) {
                finalStatus = "LOW STOCK";
            } else {
                finalStatus = "IN STOCK";
            }

            const newProduct = new ProductModel({
                name,
                price: productPrice,
                category,
                image,
                stockBatches: [{
                    quantity: productQuantity,
                    expiredAt: new Date(expiredAt)
                }],
                status: finalStatus
            });

            await newProduct.save();

            res.status(201).send({
                success: true,
                message: `New product "${name}" added successfully! 🎉`,
                data: newProduct
            });

        } catch (error) {
            console.log("Server error when creating a new product:", error.message);
            res.status(500).send({
                success: false,
                message: "Internal Server Error (Database connection or saving error)",
                error: error.message
            });
        }
    },

    putProductDetails: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, price, category, image, status, quantity, expiredAt } = req.body;

            const product = await ProductModel.findById(id);
            if (!product) {
                return res.status(404).send({
                    success: false,
                    message: "No products were found matching this ID."
                });
            }

            if (name) product.name = name;
            if (price !== undefined) product.price = parseFloat(price);
            if (category) product.category = category;
            if (image) product.image = image;
            if (status) product.status = status;

            if (quantity && expiredAt) {
                if (!product.stockBatches || !Array.isArray(product.stockBatches)) {
                    product.stockBatches = [];
                }

                product.stockBatches.push({
                    quantity: parseInt(quantity),
                    expiredAt: new Date(expiredAt)
                });
            }

            const totalQuantity = product.stockBatches.reduce((total, batch) => total + (batch.quantity || 0), 0);

            if (totalQuantity > 100) {
                return res.status(400).send({
                    success: false,
                    message: "Exceeded warehouse capacity (Maximum 100)!"
                });
            }

            if (!status) {
                if (totalQuantity === 0) {
                    product.status = "OUT OF STOCK";
                } else if (totalQuantity <= 20) {
                    product.status = "LOW STOCK";
                } else {
                    product.status = "IN STOCK";
                }
            }

            await product.save({ runValidators: true });

            res.status(200).send({
                success: true,
                message: `Product "${product.name}" has been successfully received into inventory!`,
                data: {
                    ...product.toObject(),
                    quantity: totalQuantity 
                }
            });

        } catch (error) {
            console.log("Server error when updating products:", error.message);
            res.status(500).send({
                success: false,
                message: "Internal Server Error (Database Update Error)",
                error: error.message
            });
        }
    },

    deleteProduct: async (req, res) => {
        try {
            const { id } = req.params;

            const product = await ProductModel.findById(id);
            if (!product) {
                return res.status(404).send({
                    success: false,
                    message: "This product could not be found on the system."
                });
            }

            const isProductInOrder = await OrderModel.findOne({
                items: { $elemMatch: { productId: id } }
            });

            if (isProductInOrder) {
                return res.status(400).send({
                    success: false,
                    message: `The product "${product.name}" cannot be deleted because it already exists in the system's order history. You should update the quantity to 0 (OUT OF STOCK) instead of deleting it.`
                });
            }

            await ProductModel.findByIdAndDelete(id);

            res.status(200).send({
                success: true,
                message: `The product "${product.name}" has been successfully removed from the system.`
            });

        } catch (error) {
            console.log("Server error when deleting a product:", error.message);
            res.status(500).send({
                success: false,
                message: "Internal Server Error",
                error: error.message
            });
        }
    },

    deleteExpiredBatch: async (req, res) => {
        try {
            const { productId, batchId } = req.params;

            const product = await ProductModel.findByIdAndUpdate(
                productId,
                { $pull: { stockBatches: { _id: batchId } } },
                { new: true }
            );

            if (!product) {
                return res.status(404).send({ success: false, message: "No product found." });
            }

            const totalQuantity = product.stockBatches.reduce((total, batch) => total + batch.quantity, 0);

            if (totalQuantity === 0) {
                product.status = "OUT OF STOCK";
            } else if (totalQuantity <= 20) {
                product.status = "LOW STOCK";
            } else {
                product.status = "IN STOCK";
            }

            await product.save();

            res.status(200).send({
                success: true,
                message: "The expired shipment has been successfully cancelled!",
                data: {
                    ...product.toObject(),
                    quantity: totalQuantity
                }
            });

        } catch (error) {
            console.error("Error deleting expired batches:", error);
            res.status(500).send({ success: false, message: "System error while deleting a shipment." });
        }
    }
}

export default productController