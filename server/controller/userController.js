import UserModel from "../model/users.js";
import { jwtHelper } from "../utils/jwt.js";
import bcrypt from 'bcrypt'

const userControllers = {
    resgisterUser: async (req, res) => {
        try {
            const { username, password, email, phone, avatar } = req.body

            if (!username || !password || !email || !phone || !avatar) {
                return res.status(400).json({
                    message: "This field required!!!"
                })
            }

            const salt = await bcrypt.genSaltSync(10);

            const hashingPassword = await bcrypt.hash(password, salt);

            const newUser = await UserModel.create({
                username,
                email,
                phone,
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

            user.status = "online";

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
                        name: user.username,
                        status: user.status,
                        avatar: user.avatar,
                        role: user.role
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
    logout: async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).send({
                    success: false,
                    message: "Undefine ID's User"
                });
            }

            const updateUser = await UserModel.findByIdAndUpdate(id, { status: "offline" }, { new: true });

            if (!updateUser) {
                return res.status(404).send({
                    success: false,
                    message: "The account of user is not exist !!! "
                });
            }

            res.status(200).send({
                success: true,
                message: "Success Logout 👍 "
            });
        } catch (error) {
            res.status(500).send({ success: false, message: error.message });
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

            const user = req.getuserid;

            res.status(200).send({
                success: true,
                message: "Successful get data",
                data: user
            })

        }
        catch (error) {
            console.log("Error server", error.message)
            res.status(500).send({
                success: false,
                message: "Internal Server Error",
                error: error.message
            })
        }
    },

    putUsersId: async (req, res) => {
        try {
            const user = req.userUpdate;

            const cleanData = req.validatedUpdateData;

            const updatedUser = await UserModel.findByIdAndUpdate(
                user._id,
                { $set: cleanData },
                { returnDocument: 'after' }
            );

            if (!updatedUser) {
                return res.status(404).json({ message: "Can't find the user" });
            }

            return res.status(200).json({
                success: true,
                message: "Update success ❤️",
                data: updatedUser
            });

        } catch (error) {
            return res.status(500).json({
                message: "Error server",
                error: error.message
            });
        }
    },

    deleteUser: async (req, res) => {
        try {
            const user = req.userDelete;

            const userDelete = await UserModel.findByIdAndDelete(user._id);

            if (!userDelete) {
                return res.status(404).json({
                    success: false,
                    message: "Cannot find User"
                });
            }

            res.status(200).json({
                success: true,
                message: "Success Delete user ❤️",
                data: userDelete
            });

        } catch (error) {
            console.log("Error from server:", error.message);
            res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: error.message
            });
        }
    }
}


export default userControllers