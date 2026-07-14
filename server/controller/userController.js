import { userService } from "../service/userService.js";
import { catchAsync } from "../utils/catchAsync.js";

const userControllers = {
    resgisterUser: catchAsync( async (req, res) => {
            const { username, password, email, phone, avatar } = req.body

            if (!username || !password || !email || !phone || !avatar) {
                return res.status(400).json({
                    message: "This field required!!!"
                })
            }

            const { newUser, salt, hashingPassword } = await userService.register({
                username, password, email, phone, avatar
            });

            res.status(201).json({
                message: "Success create new USER ",
                salt: salt,
                hash: hashingPassword,
                data: {
                    id: newUser._id,
                    email: newUser.email
                }
            })
    }),
    googleLogin: catchAsync( async (req, res) => {
            const { credential } = req.body;

            if (!credential) {
                return res.status(400).json({ success: false, message: "A credit token from Google is required!" });
            }

            const { user, accessToken, refreshToken } = await userService.googleLogin(credential);

            return res.status(200).json({
                success: true,
                message: "Successfully logged into Google!",
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
    }),

    forgotPassword: catchAsync( async (req, res) => {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ success: false, message: "Please enter your email address!" });
            }

            const { userExists } = await userService.requestForgotPassword(email);

            if (!userExists) {
                return res.status(200).json({ success: true, message: "If the email exists, the OTP code has been sent!" });
            }

            return res.status(200).json({
                success: true,
                message: "The OTP code has been successfully sent to your email!"
            });
    }),

    verifyOTP: catchAsync( async (req, res) => {
            const { email, otp } = req.body;
            if (!email || !otp) {
                return res.status(400).json({ success: false, message: "Email and OTP code are required!" });
            }

            const resetToken = await userService.verifyOTP(email, otp);

            return res.status(200).json({
                success: true,
                message: "OTP verification successful! You can now change your password.",
                resetToken
            });
    }),

    resetPassword: catchAsync( async (req, res) => {
            const { resetToken, newPassword, confirmPassword } = req.body;

            if (!resetToken || !newPassword || !confirmPassword) {
                return res.status(400).json({ success: false, message: "Required data is missing!" });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({ success: false, message: "The verification password doesn't match!" });
            }

            await userService.resetPassword(resetToken, newPassword);

            return res.status(200).json({
                success: true,
                message: "Password changed successfully! Please log in again with your new password."
            });
    }),

    loginUser: catchAsync( async (req, res) => {

            const user = req.user;

            const { accessToken, refreshToken, user: loggedUser } = await userService.loginUser(user);

            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
                maxAge: 15 * 60 * 1000
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
                maxAge: 30 * 24 * 60 * 60 * 1000
            });

            return res.status(200).json({
                success: true,
                message: "Success Login",
                data: {
                    user: {
                        id: loggedUser._id,
                        email: loggedUser.email,
                        name: loggedUser.username,
                        status: loggedUser.status,
                        avatar: loggedUser.avatar,
                        role: loggedUser.role
                    }
                }
            });
    }),
    logout: catchAsync( async (req, res) => {
            const { id } = req.params;

            if (!id) {
                return res.status(400).send({
                    success: false,
                    message: "Undefine ID's User"
                });
            }

            await userService.logoutUser(id);

            res.status(200).send({
                success: true,
                message: "Success Logout"
            });
    }),

    getUsers: catchAsync( async (req, res) => {
            const users = await userService.getAllUsers();

            return res.status(200).send({
                success: true,
                message: "GET list of user successful",
                data: users
            });
    }),

    getUsersId: catchAsync( async (req, res) => {

            const user = req.getuserid;

            res.status(200).send({
                success: true,
                message: "Successful get data",
                data: user
            })
    }),

    postUploadAvatar: catchAsync( async (req, res) => {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No photos were uploaded!'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Profile picture uploaded to Cloudinary successfully!',
                fileUrl: req.file.path
            });

    }),

    putUsersId: catchAsync( async (req, res) => {
            const user = req.userUpdate;
            const cleanData = req.validatedUpdateData;

            const updatedUser = await userService.updateUser(user._id, cleanData);

            return res.status(200).json({
                success: true,
                message: "Update success ",
                data: updatedUser
            });
    }),

    deleteUser: catchAsync( async (req, res) => {
            const user = req.userDelete;

            const userDelete = await userService.deleteUser(user._id);

            return res.status(200).json({
                success: true,
                message: "Success Delete user ",
                data: userDelete
            });
    })
}


export default userControllers