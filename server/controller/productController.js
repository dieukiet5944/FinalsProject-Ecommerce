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

            const response = await ProductModel.findOne({ id: id })

            if (!response) {
                return res.status(400).send({
                    success: true,
                    message: "This id is not valid or disconnect "
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

            const { name, price, category, image, quantity, status } = req.body;


            if (!name || price === undefined || !category || !image || quantity === undefined) {
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
                quantity: productQuantity,
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
            const { name, price, category, image, quantity, status } = req.body;

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

            if (quantity !== undefined) {
                const productQuantity = parseInt(quantity);

                if (productQuantity > 100) {
                    return res.status(400).send({
                        success: false,
                        message: "Số lượng tồn kho của mặt hàng không được vượt quá tối đa 100!"
                    });
                }
                product.quantity = productQuantity;
            }

            if (status) {
                product.status = status;
            } else {
                if (product.quantity === 0) {
                    product.status = "OUT OF STOCK";
                } else if (product.quantity <= 20) {
                    product.status = "LOW STOCK";
                } else {
                    product.status = "IN STOCK";
                }
            }

            await product.save({ runValidators: true });

            res.status(200).send({
                success: true,
                message: `Cập nhật thông tin sản phẩm "${product.name}" thành công!`,
                data: product
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
    }
}

export default productController