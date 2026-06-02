import UserModel from "../model/users.js";
import { jwtHelper } from "../utils/jwt.js";
import bcrypt from 'bcrypt'
import crypto from 'crypto'

const userControllers = {
    resgisterUser: async (req, res) => {
        try {
            const { username, password, email, phone, avatar } = req.body

            if (!username || !password || !email || !phone || !avatar) {
                return res.status(400).json({
                    message: "This field required!!!"
                })
            }

            const user = await UserModel.findOne({ email });

            if (user) {
                return res.status(403).json({
                    message: "Oh no this email is valid, so you need to have another email !!!"
                })
            }

            const salt = await bcrypt.genSaltSync(10);

            const hashingPassword = await bcrypt.hash(password, salt);

            const newUser = await UserModel.create({
                username,
                email,
                phone,
                id: "ORD" + crypto.randomUUID(),
                password: hashingPassword,
                role: "user",
                status: "offline",
                avatar
            })

            res.status(201).json({
                message: "Success create new USER ",
                salt: salt,
                hash: hashingPassword,
                data: {
                    id: newUser._id,
                    email: newUser.email
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
    loginUser: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = req.user;

            const accessToken = jwtHelper.generateAccessToken({
                userId: user._id,
                email: user.email
            });

            const refreshToken = jwtHelper.generateRefreshToken({
                userId: user._id,
                email: user.email
            });


            user.refreshToken = refreshToken;

            await user.save();

            return res.status(200).json({
                success: true,
                message: "Success Login ❤️",
                data: {
                    accessToken,
                    refreshToken,
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name
                    }
                }
            });
        } catch (error) {
            console.error("Error at loginUser:", error.message);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: error.message
            });
        }
    },
    getUsers: async (req, res) => {
        try {
            const response = await UserModel.find({});

            if (response.length === 0) {
                return res.status(404).send({
                    success: false,
                    message: "The list of users is empty!!"
                })
            }

            return res.status(200).send({
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

            const cleanData = req.validatedUpdateData;

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $set: cleanData },
                { new: true, runValidators: true } 
            );

            if (!updatedUser) {
                return res.status(404).json({ message: "Không tìm thấy người dùng này!" });
            }

            return res.status(200).json({
                message: "Cập nhật dữ liệu thành công!",
                data: updatedUser
            });

        } catch (error) {
            return res.status(500).json({
                message: "Lỗi xử lý cập nhật trên Server",
                error: error.message
            });
        }
    }
}


export default userControllers