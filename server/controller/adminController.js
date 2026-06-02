import AdminModel from "../model/admin.js";
import { jwtHelper } from "../utils/jwt.js";
import bcrypt from 'bcrypt'

const adminController = {
    getAdmin: async (req, res) => {
        try {

            const response = await AdminModel.find({});

            if (!response) throw new Error(" Can't get data from database");

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
                        name: admin.name
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
                avatar: "https://link-anh-cua-hoa.png",
                role: "admin",
                status: "active"
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
}

export default adminController