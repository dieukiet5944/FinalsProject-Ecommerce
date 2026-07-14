import { adminRepository } from "../repositories/adminRepository.js";
import bcrypt from 'bcrypt';
import { jwtHelper } from "../utils/jwt.js";

export const adminService = {
    getAllAdmins: async () => {
        const admins = await adminRepository.findAll();
        if (!admins || admins.length === 0) {
            throw new Error("Can't get data from database");
        }
        return admins;
    },

    loginAdmin: async (admin) => {
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

        return { admin, accessToken, refreshToken };
    },

    logoutAdmin: async (id) => {
        const updatedAdmin = await adminRepository.updateById(id, { status: "offline" });
        if (!updatedAdmin) {
            throw new Error("The Admin account does not exist in the system.");
        }
        return updatedAdmin;
    },

    registerAdmin: async ({ email, name, phoneNumber, password }) => {
        const existingAdmin = await adminRepository.findByEmail(email);
        if (existingAdmin) {
            throw new Error("Oh no this email is valid, so you need to have another email !!!");
        }

        const salt = await bcrypt.genSalt(10);
        const hashingPassword = await bcrypt.hash(password, salt);

        const newAdmin = await adminRepository.create({
            name,
            email,
            phoneNumber,
            password: hashingPassword,
            avatar: "logo-admin.jpg",
            role: "admin",
        });

        return { newAdmin, salt, hashingPassword };
    },

    refreshAdminToken: async (refreshToken) => {
        const decoded = jwtHelper.verifyRefreshToken(refreshToken);
        
        const adminId = decoded.adminId || decoded.userId; 

        const admin = await adminRepository.findById(adminId);
        if (!admin) {
            throw new Error("Admin not found");
        }

        if (admin.refreshToken !== refreshToken) {
            throw new Error("Invalid refresh token");
        }

        const newAccessToken = jwtHelper.generateAccessToken({
            adminId: admin._id,
            email: admin.email
        });

        return newAccessToken;
    },

    updateAdmin: async (id, updateData) => {
        const admin = await adminRepository.findById(id);
        if (!admin) {
            throw new Error("Admin not found");
        }

        if (updateData.currentPassword && updateData.newPassword) {
            const isMatch = await bcrypt.compare(updateData.currentPassword, admin.password);
            if (!isMatch) {
                throw new Error("Current password incorrect");
            }
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.newPassword, salt);
            
            delete updateData.currentPassword;
            delete updateData.newPassword;
        }

        return await adminRepository.updateById(id, updateData);
    }
};