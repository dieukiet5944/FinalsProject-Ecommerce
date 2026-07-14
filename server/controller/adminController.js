import { adminService } from "../service/adminService.js";
import { catchAsync } from "../utils/catchAsync.js";

const adminController = {
    getAdmin: catchAsync(async (req, res) => {
        const admins = await adminService.getAllAdmins();
        
        return res.status(200).send({
            success: true,
            message: "Successful catch this data admin",
            data: admins
        });
    }),

    loginAdmin: catchAsync( async (req, res) => {
            const admin = req.admin; 

            const { admin: loggedAdmin, accessToken, refreshToken } = await adminService.loginAdmin(admin);

            return res.status(200).json({
                message: "Success Login",
                data: {
                    accessToken,
                    refreshToken,
                    admin: {
                        id: loggedAdmin._id,
                        email: loggedAdmin.email,
                        name: loggedAdmin.name,
                        avatar: loggedAdmin.avatar,
                        role: loggedAdmin.role,
                        createAt: loggedAdmin.createdAt,
                        phone: loggedAdmin.phoneNumber
                    }
                }
            });
    }),

    logoutAdmin: catchAsync( async (req, res) => {
            const { id } = req.params;

            if (!id) {
                return res.status(400).send({
                    success: false,
                    message: "The administrator's ID could not be recognized to log out."
                });
            }

            await adminService.logoutAdmin(id);

            return res.status(200).send({
                success: true,
                message: "Logout successful!"
            });
    }),

    registerAdmin: catchAsync( async (req, res) => {
            const { email, name, phoneNumber, password } = req.body;

            if (!email || !name || !phoneNumber || !password) {
                return res.status(400).json({
                    message: "This field required!!!"
                });
            }

            const { newAdmin, salt, hashingPassword } = await adminService.registerAdmin({
                email, name, phoneNumber, password
            });

            return res.status(201).json({
                message: "Success create new ADMIN ",
                salt: salt,
                hash: hashingPassword,
                data: {
                    id: newAdmin._id,
                    email: newAdmin.email
                }
            });
    }),

    refreshToken: catchAsync( async (req, res) => {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: "Refresh token is required"
                });
            }

            const newAccessToken = await adminService.refreshAdminToken(refreshToken);

            return res.status(200).json({
                success: true,
                data: {
                    accessToken: newAccessToken
                }
            });
    }),

    putAdminId: catchAsync( async (req, res) => {
            const { id } = req.params;
            const updateData = req.body;

            const updatedAdmin = await adminService.updateAdmin(id, updateData);

            return res.status(200).json({
                success: true,
                message: "Update successful!",
                data: updatedAdmin
            });
    }),
};

export default adminController;