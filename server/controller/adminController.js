import AdminModel from "../model/admin.js";
import { jwtHelper } from "../utils/jwt.js";
import bcrypt from 'bcrypt'

const adminController = {
    getAdmin: async (req, res) => {
        try {

            const response = await AdminModel.find();

            if (!response || response.length === 0) throw new Error(" Can't get data from database");

            return res.status(200).send({
                success: true,
                message: "Successful catch this data admin",
                data: response
            })

        }
        catch (error) {
            console.log("Error", error.message)
            res.status(500).send({
                success: false,
                message: "Internal Server Error",
                error: error.message
            })
        }
    },

    loginAdmin: async (req, res) => {
        try {
            const { email, password } = req.body;

            const admin = req.admin;

            const accessToken = jwtHelper.generateAccessToken({
                adminId: admin._id,
                email: admin.email
            });

            const refreshToken = jwtHelper.generateRefreshToken({
                adminId: admin._id,
                email: admin.email
            });

            admin.status = "online";

            admin.refreshToken = refreshToken;

            await admin.save();

            return res.status(200).json({
                message: "Success Login ❤️",
                data: {
                    accessToken,
                    refreshToken,
                    admin: {
                        id: admin._id,
                        email: admin.email,
                        name: admin.name,
                        avatar: admin.avatar,
                        role: admin.role,
                        createAt: admin.createdAt,
                        phone: admin.phoneNumber
                    }
                }
            });
        } catch (error) {
            console.error("Error at loginAdmin:", error.message);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: error.message
            });
        }
    },

    logoutAdmin: async (req, res) => {
        try {
            const { id } = req.params;

            if (!id || id === 'undefined') {
                id = req.body.userId;
            }

            if (!id) {
                return res.status(400).send({
                    success: false,
                    message: "Không nhận diện được ID của Admin để thực hiện đăng xuất."
                });
            }

            const updatedAdmin = await AdminModel.findByIdAndUpdate(id, { status: "offline" }, { new: true });

            if (!updatedAdmin) {
                return res.status(404).send({
                    success: false,
                    message: "Tài khoản Admin không tồn tại trong hệ thống."
                });
            }

            res.status(200).send({
                success: true,
                message: "Đăng xuất thành công!"
            });
        } catch (error) {
            res.status(500).send({ success: false, message: error.message });
        }
    },

    registerAdmin: async (req, res) => {
        try {
            const { email, name, phoneNumber, password } = req.body

            if (!email || !name || !phoneNumber || !password) {
                return res.status(400).json({
                    message: "This field required!!!"
                })
            }


            const admin = await AdminModel.findOne({ email });

            if (admin) {
                return res.status(403).json({
                    message: "Oh no this email is valid, so you need to have another email !!!"
                })
            }

            const salt = await bcrypt.genSaltSync(10);

            const hashingPassword = await bcrypt.hash(password, salt);

            const newAdmin = await AdminModel.create({
                name,
                email,
                phoneNumber,
                password: hashingPassword,
                avatar: "logo-admin.jpg",
                role: "admin",
            })

            res.status(201).json({
                message: "Success create new ADMIN ",
                salt: salt,
                hash: hashingPassword,
                data: {
                    id: newAdmin._id,
                    email: newAdmin.email
                }
            })


        } catch (error) {
            console.log("Error", error.message)
            res.status(500).send({
                success: false,
                message: "Internal Server Error",
                error: error.message
            })
        }
    },

    refreshToken: async (req, res) => {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: "Refresh token is required"
                });
            }

            // Verify refresh token
            const decoded = jwtHelper.verifyRefreshToken(refreshToken);

            // Find user and check if refresh token matches
            const admin = await AdminModel.findById(decoded.userId);

            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            if (admin.refreshToken !== refreshToken) {
                return res.status(403).json({
                    success: false,
                    message: "Invalid refresh token"
                });
            }

            // Generate new access token
            const newAccessToken = jwtHelper.generateAccessToken({
                userId: admin._id,
                email: admin.email
            });

            return res.status(200).json({
                success: true,
                data: {
                    accessToken: newAccessToken
                }
            });

        } catch (error) {
            console.error("Error at refreshToken:", error.message);
            return res.status(403).json({
                success: false,
                message: "Invalid or expired refresh token",
                error: error.message
            });
        }
    },

    putAdminId: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const admin = await AdminModel.findById(id);
            if (!admin) return res.status(404).json({ message: "Admin not found" });

            if (updateData.currentPassword && updateData.newPassword) {
                updateData.password = hashingPassword;
                delete updateData.currentPassword; 
                delete updateData.newPassword;
            }

            const updatedAdmin = await AdminModel.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true }
            );

            return res.status(200).json({
                success: true,
                message: "Cập nhật thành công!",
                data: updatedAdmin
            });

        } catch (error) {
            return res.status(500).json({
                message: "Lỗi xử lý cập nhật trên Server",
                error: error.message
            });
        }
    },
}

export default adminController