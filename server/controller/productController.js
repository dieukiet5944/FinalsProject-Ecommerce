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
                    message: "Vui lòng nhập đầy đủ các thông tin bắt buộc: Tên, Giá, Danh mục, Hình ảnh và Số lượng tồn kho."
                });
            }


            if (!["CAKE", "DRINK"].includes(category)) {
                return res.status(400).send({
                    success: false,
                    message: "Danh mục sản phẩm không hợp lệ. Chỉ chấp nhận 'CAKE' hoặc 'DRINK'."
                });
            }


            const productQuantity = parseInt(quantity);
            const productPrice = parseFloat(price);

            if (productQuantity > 100) {
                return res.status(400).send({
                    success: false,
                    message: "Số lượng sản phẩm khi tạo mới không được vượt quá tối đa 100!"
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
                message: `Thêm mới sản phẩm "${name}" thành công! 🎉`,
                data: newProduct
            });

        } catch (error) {
            console.log("Lỗi Server khi tạo sản phẩm mới:", error.message);
            res.status(500).send({
                success: false,
                message: "Internal Server Error (Lỗi kết nối hoặc lưu Database)",
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
                    message: "Không tìm thấy sản phẩm với ID này."
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
                    message: "Vượt quá sức chứa kho cho phép (Tối đa 100)!"
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
                message: `Nhập kho sản phẩm "${product.name}" thành công!`,
                data: {
                    ...product.toObject(),
                    quantity: totalQuantity 
                }
            });

        } catch (error) {
            console.log("Lỗi Server khi cập nhật sản phẩm:", error.message);
            res.status(500).send({
                success: false,
                message: "Internal Server Error (Lỗi cập nhật Database)",
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
                    message: "Không tìm thấy sản phẩm này trên hệ thống."
                });
            }

            const isProductInOrder = await OrderModel.findOne({
                items: { $elemMatch: { productId: id } }
            });

            if (isProductInOrder) {
                return res.status(400).send({
                    success: false,
                    message: `Không thể xóa sản phẩm "${product.name}" vì sản phẩm này đã tồn tại trong lịch sử đơn hàng của hệ thống. Bạn nên cập nhật số lượng về 0 (OUT OF STOCK) thay vì xóa.`
                });
            }

            await ProductModel.findByIdAndDelete(id);

            res.status(200).send({
                success: true,
                message: `Đã xóa thành công sản phẩm "${product.name}" khỏi hệ thống.`
            });

        } catch (error) {
            console.log("Lỗi Server khi xóa sản phẩm:", error.message);
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
                return res.status(404).send({ success: false, message: "Không tìm thấy sản phẩm." });
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
                message: "Đã hủy bỏ lô hàng hết hạn thành công!",
                data: {
                    ...product.toObject(),
                    quantity: totalQuantity
                }
            });

        } catch (error) {
            console.error("Lỗi xóa lô hết hạn:", error);
            res.status(500).send({ success: false, message: "Lỗi hệ thống khi xóa lô hàng." });
        }
    }
}

export default productController