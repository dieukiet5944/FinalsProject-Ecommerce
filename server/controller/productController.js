import ProductModel from "../model/products";
import OrderModel from "../model/order";

const crypto = require("crypto");

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
            const { name, price, category, image, capacity, currentstock, expiryDate } = req.body;

            // 1. Kiểm tra các trường bắt buộc phải có (required: true theo schema)
            if (!name || !price || !category || !image || capacity === undefined || !expiryDate) {
                return res.status(400).send({
                    success: false,
                    message: "Vui lòng nhập đầy đủ các thông tin: Tên, Giá, Danh mục, Hình ảnh, Sức chứa và Hạn sử dụng."
                });
            }

            // Kiểm tra xem category truyền lên có đúng enum ["CAKE", "DRINK"] không
            if (!["CAKE", "DRINK"].includes(category)) {
                return res.status(400).send({
                    success: false,
                    message: "Danh mục sản phẩm không hợp lệ. Chỉ chấp nhận 'CAKE' hoặc 'DRINK'."
                });
            }

            // 2. Định dạng số lượng tồn kho ban đầu
            const initCapacity = parseInt(capacity);
            // Nếu admin không truyền currentstock thì mặc định là 0 (đúng theo default: 0 trong schema)
            const initCurrentStock = currentstock !== undefined ? parseInt(currentstock) : 0;

            if (initCurrentStock > initCapacity) {
                return res.status(400).send({
                    success: false,
                    message: `Số lượng tồn kho hiện tại (${initCurrentStock}) không thể lớn hơn sức chứa tối đa (${initCapacity}).`
                });
            }

            // 3. TỰ ĐỘNG TÍNH TOÁN TRẠNG THÁI SẢN PHẨM (PRODUCT STATUS) BAN ĐẦU
            let initialStatus = "IN STOCK";
            if (initCurrentStock === 0) {
                initialStatus = "OUT OF STOCK";
            } else if (initCurrentStock <= 5) {
                initialStatus = "LOW STOCK";
            }

            // 4. TỰ ĐỘNG TẠO MÃ ID DUY NHẤT CHO SẢN PHẨM (Dạng chuỗi String giống mã Order)
            // Ví dụ tạo ra: PROD-E4F2A1B9
            const productId = "PROD-" + crypto.randomBytes(4).toString("hex").toUpperCase();

            // 5. TỰ ĐỘNG TẠO NGÀY TẠO (createdAt) DẠNG STRING THEO SCHEMA CỦA BẠN
            // Định dạng chuỗi ngày chuẩn: "YYYY-MM-DD"
            const currentDateStr = new Date().toISOString().substring(0, 10);

            // 6. Khởi tạo thực thể Product mới
            const newProduct = new ProductModel({
                id: productId,
                name,
                price: parseFloat(price),
                category,
                image,
                stock: {
                    capacity: initCapacity,
                    currentstock: initCurrentStock
                },
                createdAt: currentDateStr, // Gán chuỗi ngày tạo viết tay theo schema của bạn
                expiryDate,                 // Chuỗi ngày hết hạn do Admin chọn từ frontend
                status: initialStatus
            });

            // 7. Lưu sản phẩm mới vào Database
            await newProduct.save();

            // 8. Phản hồi thành công về cho Admin dashboard
            res.status(201).send({
                success: true,
                message: `Thêm mới sản phẩm "${name}" thành công!`,
                data: newProduct
            });

        } catch (error) {
            console.log("Loi server khi tao san pham moi:", error.message);

            // Đề phòng trường hợp trùng mã id ngẫu nhiên (tỷ lệ cực thấp nhưng vẫn check cho chắc chắn)
            if (error.code === 11000) {
                return res.status(400).send({
                    success: false,
                    message: "Mã ID sản phẩm đã tồn tại, vui lòng thử lại.",
                    error: error.message
                });
            }

            res.status(500).send({
                success: false,
                message: "Internal Server Error",
                error: error.message
            });
        }
    },

    putRestockProduct: async (req, res) => {
        try {
            const { id } = req.params;
            // Số lượng sản phẩm muốn nhập thêm vào kho (Ví dụ: nhập thêm 50 cái bánh)
            const { quantityToAdd } = req.body;

            // 1. Kiểm tra dữ liệu đầu vào
            const restockQuantity = parseInt(quantityToAdd);
            if (!restockQuantity || restockQuantity <= 0) {
                return res.status(400).send({
                    success: false,
                    message: "Vui lòng cung cấp số lượng nhập kho hợp lệ (phải lớn hơn 0)."
                });
            }

            // 2. Tìm sản phẩm dựa trên trường id (String) trong schema của bạn
            const product = await Product.findOne({ id: id });
            if (!product) {
                return res.status(404).send({
                    success: false,
                    message: "Không tìm thấy sản phẩm với ID này."
                });
            }

            // 3. Kiểm tra xem số lượng sau khi nhập có vượt quá sức chứa tối đa (capacity) không
            const potentialStock = product.stock.currentstock + restockQuantity;
            if (potentialStock > product.stock.capacity) {
                return res.status(400).send({
                    success: false,
                    message: `Nhập kho thất bại! Sức chứa tối đa của sản phẩm này là ${product.stock.capacity}. Hiện tại đã có ${product.stock.currentstock}, bạn chỉ có thể nhập tối đa thêm ${product.stock.capacity - product.stock.currentstock} sản phẩm.`
                });
            }

            // 4. Tiến hành cộng dồn số lượng vào kho hiện tại
            product.stock.currentstock = potentialStock;

            // 5. TỰ ĐỘNG CẬP NHẬT LẠI TRẠNG THÁI SẢN PHẨM (PRODUCT STATUS)
            // Sau khi nhập thêm hàng, hệ thống sẽ tự động tính toán lại nhãn trạng thái cho Admin thấy
            if (product.stock.currentstock === 0) {
                product.status = "OUT OF STOCK";
            } else if (product.stock.currentstock <= 5) { // Ngưỡng LOW STOCK (bạn có thể tự chỉnh)
                product.status = "LOW STOCK";
            } else {
                product.status = "IN STOCK";
            }

            // 6. Lưu thay đổi vào Database
            // Vì Schema của bạn có dùng { timestamps: true }, trường updatedAt sẽ tự động cập nhật thời gian nhập kho này
            await product.save();

            // 7. Phản hồi thành công về cho Admin giao diện
            res.status(200).send({
                success: true,
                message: `Nhập kho thành công sản phẩm "${product.name}"!`,
                data: product
            });

        } catch (error) {
            console.log("Loi server khi nhap kho san pham:", error.message);
            res.status(500).send({
                success: false,
                message: "Internal Server Error",
                error: error.message
            });
        }
    },

    putProductDetails: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, price, category, image, capacity, currentstock, expiryDate } = req.body;

            // 1. Tìm sản phẩm hiện tại trong Database dựa trên trường id (String)
            const product = await ProductModel.findOne({ id: id });
            if (!product) {
                return res.status(404).send({
                    success: false,
                    message: "Không tìm thấy sản phẩm với ID này."
                });
            }

            // 2. Kiểm tra và cập nhật các trường cơ bản nếu client có truyền lên
            if (name) product.name = name;
            if (price) product.price = price;
            if (category) product.category = category; // Tự động check enum ["CAKE", "DRINK"] qua schema
            if (image) product.image = image;
            if (expiryDate) product.expiryDate = expiryDate;

            // 3. Xử lý logic nâng cao cho phần STOCK
            // Cập nhật capacity (Sức chứa tối đa) nếu có thay đổi
            if (capacity !== undefined) {
                product.stock.capacity = capacity;
            }

            // Cập nhật currentstock (Số lượng thực tế) nếu admin sửa tay trực tiếp
            if (currentstock !== undefined) {
                // Kiểm tra xem số lượng sửa tay có vượt quá sức chứa hiện tại không
                if (currentstock > product.stock.capacity) {
                    return res.status(400).send({
                        success: false,
                        message: `Số lượng tồn kho hiện tại không thể lớn hơn sức chứa tối đa (${product.stock.capacity}).`
                    });
                }
                product.stock.currentstock = currentstock;
            }

            // 4. TỰ ĐỘNG ĐỒNG BỘ LẠI TRẠNG THÁI SẢN PHẨM (PRODUCT STATUS)
            // Đề phòng trường hợp Admin sửa tay 'currentstock' làm thay đổi trạng thái hàng hóa
            if (product.stock.currentstock === 0) {
                product.status = "OUT OF STOCK";
            } else if (product.stock.currentstock <= 5) {
                product.status = "LOW STOCK";
            } else {
                product.status = "IN STOCK";
            }

            // 5. Lưu tất cả thay đổi vào Database
            // Thuộc tính { runValidators: true } giúp Mongoose kiểm tra lại các enum xem có hợp lệ không trước khi lưu
            await product.save({ runValidators: true });

            // 6. Phản hồi thành công về cho Admin dashboard
            res.status(200).send({
                success: true,
                message: "Cập nhật thông tin sản phẩm thành công!",
                data: product
            });

        } catch (error) {
            console.log("Loi server khi cap nhat san pham:", error.message);
            res.status(500).send({
                success: false,
                message: "Internal Server Error",
                error: error.message
            });
        }
    },

    deleteProduct: async (req, res) => {
        try {
            const { id } = req.params;

            // 1. Tìm sản phẩm hiện tại trong Database dựa trên trường id (String)
            const product = await ProductModel.findOne({ id: id });
            if (!product) {
                return res.status(404).send({
                    success: false,
                    message: "Không tìm thấy sản phẩm với ID này trên hệ thống."
                });
            }

            // 2. RÀNG BUỘC DỮ LIỆU (Điểm cộng cực lớn cho đồ án):
            // Kiểm tra xem sản phẩm này đã từng nằm trong đơn hàng nào chưa
            // Sử dụng toán tử $elemMatch của MongoDB để tìm trong mảng items của tất cả các Order
            const isProductInOrder = await OrderModel.findOne({
                items: { $elemMatch: { productId: id } }
            });

            if (isProductInOrder) {
                return res.status(400).send({
                    success: false,
                    message: `Không thể xóa sản phẩm "${product.name}" vì sản phẩm này đã tồn tại trong lịch sử đơn hàng của hệ thống. Bạn nên cập nhật trạng thái sang "OUT OF STOCK" thay vì xóa.`
                });
            }

            // 3. Nếu kiểm tra an toàn (chưa từng được mua), tiến hành xóa sản phẩm khỏi Database
            await ProductModel.deleteOne({ id: id });

            // 4. Phản hồi thành công về cho Admin dashboard
            res.status(200).send({
                success: true,
                message: `Đã xóa thành công sản phẩm "${product.name}" khỏi hệ thống.`
            });

        } catch (error) {
            console.log("Loi server khi xoa san pham:", error.message);
            res.status(500).send({
                success: false,
                message: "Internal Server Error",
                error: error.message
            });
        }
    }
}

export default productController