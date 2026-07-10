import UserModel from "../model/users.js";
import { jwtHelper } from "../utils/jwt.js";
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt'
import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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
    googleLogin: async (req, res) => {
        try {
            const { credential } = req.body;

            if (!credential) {
                return res.status(400).json({ success: false, message: "A credit token from Google is required!" });
            }

            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            const { email, name, picture, sub } = payload; 

            let user = await UserModel.findOne({ email });

            if (!user) {
                user = await UserModel.create({
                    username: name,
                    email: email,
                    googleId: sub,
                    avatar: picture,
                    role: "user",
                    status: "online",
                    phone: "Not yet updated" 
                });
            } else {
                if (!user.googleId) {
                    user.googleId = sub;
                }
                user.status = "online";
            }

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

        } catch (error) {
            console.log("Google Login Error:", error.message);
            return res.status(500).json({
                success: false,
                message: "Google authentication failed or system error",
                error: error.message
            });
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ success: false, message: "Please enter your email address!" });
            }

            const user = await UserModel.findOne({ email });
            if (!user) {
                return res.status(200).json({ success: true, message: "If the email exists, the OTP code has been sent!" });
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            const hashedOTP = crypto.createHash('sha256').update(otp).update(user.salt || '').digest('hex');

            user.resetPasswordOTP = hashedOTP;
            user.resetPasswordExpires = Date.now() + 5 * 60 * 1000;
            await user.save();

            const mailOptions = {
                from: `"The Crumb & Bean" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'YOUR PASSWORD VERIFICATION CODE',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                    <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
                    <p>Hello,</p>
                    <p>We have received a password change request from your account. Please use the OTP code below to proceed:</p>
                    <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #d9534f; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p style="color: #777; font-size: 12px;">This OTP code is valid within <b>5 minutes</b>. If you are not making this request, please ignore this email.</p>
                </div>
            `
            };

            await transporter.sendMail(mailOptions);

            return res.status(200).json({
                success: true,
                message: "The OTP code has been successfully sent to your email!"
            });

        } catch (error) {
            return res.status(500).json({ success: false, message: "Email sending error: " + error.message });
        }
    },

    verifyOTP: async (req, res) => {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) {
                return res.status(400).json({ success: false, message: "Email and OTP code are required!" });
            }

            const user = await UserModel.findOne({ email });
            if (!user || !user.resetPasswordOTP || !user.resetPasswordExpires) {
                return res.status(400).json({ success: false, message: "The request is invalid or has expired!" });
            }

            if (Date.now() > user.resetPasswordExpires) {
                user.resetPasswordOTP = null;
                user.resetPasswordExpires = null;
                await user.save();
                return res.status(400).json({ success: false, message: "The OTP code has expired!" });
            }

            const hashedInputOTP = crypto.createHash('sha256').update(otp).update(user.salt || '').digest('hex');

            if (hashedInputOTP !== user.resetPasswordOTP) {
                return res.status(400).json({ success: false, message: "The OTP code is incorrect!" });
            }

            const resetToken = jwtHelper.generateAccessToken({ userId: user._id, purpose: "password-reset" });

            return res.status(200).json({
                success: true,
                message: "OTP verification successful! You can now change your password.",
                resetToken 
            });

        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    resetPassword: async (req, res) => {
        try {
            const { resetToken, newPassword, confirmPassword } = req.body;

            if (!resetToken || !newPassword || !confirmPassword) {
                return res.status(400).json({ success: false, message: "Required data is missing!" });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({ success: false, message: "The verification password doesn't match!" });
            }

            let decoded;
            try {
                decoded = jwtHelper.verifyAccessToken(resetToken);
            } catch (err) {
                return res.status(401).json({ success: false, message: "The session has expired or the token is invalid!" });
            }

            if (decoded.purpose !== "password-reset") {
                return res.status(403).json({ success: false, message: "Access denied!" });
            }

            const user = await UserModel.findById(decoded.userId);
            if (!user) {
                return res.status(404).json({ success: false, message: "No user found!" });
            }

            const salt = await bcrypt.genSaltSync(10);
            const hashingPassword = await bcrypt.hash(newPassword, salt);

            user.password = hashingPassword;
            user.resetPasswordOTP = null;
            user.resetPasswordExpires = null;
            user.status = "offline"; 
            await user.save();

            return res.status(200).json({
                success: true,
                message: "Password changed successfully! Please log in again with your new password."
            });

        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
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
                message: "Success Logout"
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

    postUploadAvatar: async (req, res) => {
        try {
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

        } catch (error) {
            console.error("Error in postUploadAvatar:", error);
            return res.status(500).json({
                success: false,
                message: 'Server error while loading profile picture!'
            });
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
                message: "Update success ",
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
                message: "Success Delete user ",
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