import UserModel from "../model/users";

const userControllers = {
    getUsers: async (req, res) => {
        try {
            const response = await UserModel.find({});

            if (response.length === 0) {
                return res.status(404).send({
                    success: false,
                    message: "The list of users is empty!!"
                })
            }

            return res.status(200).find({
                success: true,
                message: "GET list of user successful",
                data: response
            })
        }
        catch {
            res.status(403).send({
                message: error.message,
                data: null,
                success: false,
            });
        }
    },

    getUsersId: async (req, res) => {
        try {

            const { userId } = req.params

            const response = await UserModel.findOne({ id: userId })

            if (!response) {
                return res.status(400).send({
                    success: true,
                    message: "This ID is not valid or disconnect "
                })
            }
            res.status(200).send({
                success: true,
                message: "Successful get data",
                data: response
            })

        }
        catch (error) {
            console.log("Loi server", error.message)
            res.status(500).send({
                success: false,
                message: "Internal Server Error",
                error: error.message
            })
        }
    },

    putUsersId: async (req, res) => {
        try {
            const { userId } = req.params;
            const { username, password, full_name, email, phone, role, status, avatar } = req.body;

            // 1. Tạo object lưu các trường muốn update
            const updateData = {};

            // 2. Kiểm tra và thêm các trường người dùng truyền lên vào object update
            if (username) updateData.username = username;
            if (password) updateData.password = password;
            if (full_name) updateData.full_name = full_name;
            if (email) updateData.email = email;
            if (phone) updateData.phone = phone;
            if (role) updateData.role = role;
            if (status) updateData.status = status;
            if (avatar) updateData.avatar = avatar;

            // Luôn cập nhật thời gian hoạt động cuối cùng khi họ update profile
            updateData.last_active = Date.now();

            // 4. Tiến hành cập nhật trong Database
            // { new: true }: Trả về dữ liệu mới sau khi đã update
            // { runValidators: true }: Chạy validation của schema (VD: check enum "customer", "admin")
            const updatedUser = await UserModel.findByIdAndUpdate(
                userId,
                updateData,
                { new: true, runValidators: true }
            ).select("-password"); // Không trả mật khẩu về cho client vì lý do bảo mật

            // 5. Kiểm tra nếu không tìm thấy user
            if (!updatedUser) {
                return res.status(404).send({
                    success: false,
                    message: "Không tìm thấy người dùng với ID này."
                });
            }

            // 6. Phản hồi thành công
            res.status(200).send({
                success: true,
                message: "Cập nhật thông tin người dùng thành công!",
                data: updatedUser
            });

        } catch (error) {
            console.log("Loi server", error.message);

            // Xử lý lỗi trùng lặp (Kèm thuộc tính unique: true như username, email)
            if (error.code === 11000) {
                return res.status(400).send({
                    success: false,
                    message: "Username hoặc Email này đã tồn tại trên hệ thống.",
                    error: error.message
                });
            }

            res.status(500).send({
                success: false,
                message: "Internal Server Error",
                error: error.message
            });
        }
    }
} 


export default userControllers