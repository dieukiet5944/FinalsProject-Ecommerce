import UserModel from "../model/users.js";
import crypto from 'crypto';
import { authService } from "./authService.js";
import { emailService } from "./emailService.js";
import { userRepository } from "../repositories/userRepository.js";

export const userService = {
    register: async ({ username, password, email, phone, avatar }) => {
        const { salt, hashingPassword } = await authService.hashPassword(password);

        const newUser = await userRepository.create({
            username,
            email,
            phone,
            password: hashingPassword,
            role: "user",
            status: "offline",
            avatar
        });

        return {
            newUser,
            salt,
            hashingPassword
        };
    },

    googleLogin: async (credential) => {
        const payload = await authService.verifyGoogleToken(credential);
        const { email, name, picture, sub } = payload;

        let user = await userRepository.findByEmail( email );

        if (!user) {
            user = await userRepository.create({
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

        const { accessToken, refreshToken } = authService.generateAuthTokens({
            userId: user._id,
            email: user.email
        });

        user.refreshToken = refreshToken;
        await user.save();

        return { user, accessToken, refreshToken };
    },

    requestForgotPassword: async (email) => {
        const user = await userRepository.findByEmail({ email });
        if (!user) {
            return { userExists: false };
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOTP = crypto.createHash('sha256').update(otp).update(user.salt || '').digest('hex');

        user.resetPasswordOTP = hashedOTP;
        user.resetPasswordExpires = Date.now() + 5 * 60 * 1000;
        await user.save();

        await emailService.sendOTPEmail(user.email, otp);

        return { userExists: true };
    },

    verifyOTP: async (email, otp) => {
        const user = await userRepository.findByEmail({ email });
        if (!user || !user.resetPasswordOTP || !user.resetPasswordExpires) {
            throw new Error("The request is invalid or has expired!");
        }

        if (Date.now() > user.resetPasswordExpires) {
            user.resetPasswordOTP = null;
            user.resetPasswordExpires = null;
            await user.save();
            throw new Error("The OTP code has expired!");
        }

        const hashedInputOTP = crypto.createHash('sha256').update(otp).update(user.salt || '').digest('hex');
        if (hashedInputOTP !== user.resetPasswordOTP) {
            throw new Error("The OTP code is incorrect!");
        }

        const resetToken = authService.generateAuthTokens({ 
            userId: user._id, 
            purpose: "password-reset" 
        }).accessToken; 

        return resetToken;
    },

    resetPassword: async (resetToken, newPassword) => {
        let decoded;
        try {
            decoded = authService.verifyResetToken(resetToken);
        } catch (err) {
            throw new Error("The session has expired or the token is invalid!");
        }

        if (decoded.purpose !== "password-reset") {
            throw new Error("Access denied!");
        }

        const user = await userRepository.findById(decoded.userId);
        if (!user) {
            throw new Error("No user found!");
        }

        const { hashingPassword } = await authService.hashPassword(newPassword);

        user.password = hashingPassword;
        user.resetPasswordOTP = null;
        user.resetPasswordExpires = null;
        user.status = "offline";
        await user.save();

        return user;
    },

    loginUser: async (user) => {
        const { accessToken, refreshToken } = authService.generateAuthTokens({
            userId: user._id,
            email: user.email
        });

        user.status = "online";
        user.refreshToken = refreshToken;
        await user.save();

        return { accessToken, refreshToken, user };
    },

    logoutUser: async (id) => {
        const updateUser = await userRepository.updateById(id, { status: "offline" }, { new: true });
        if (!updateUser) {
            throw new Error("The account of user is not exist !!!");
        }
        return updateUser;
    },

    getAllUsers: async () => {
        const users = await userRepository.findAll();
        if (users.length === 0) {
            throw new Error("The list of users is empty!!");
        }
        return users;
    },

    updateUser: async (userId, updateData) => {
        const updatedUser = await userRepository.updateById(
            userId,
            { $set: updateData },
            { returnDocument: 'after' }
        );
        if (!updatedUser) {
            throw new Error("Can't find the user");
        }
        return updatedUser;
    },

    deleteUser: async (userId) => {
        const deletedUser = await userRepository.deleteById(userId);
        if (!deletedUser) {
            throw new Error("Cannot find User");
        }
        return deletedUser;
    }
};