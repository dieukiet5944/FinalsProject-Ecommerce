import AdminModel from "../model/admin.js";

export const adminRepository = {
    findAll: async () => {
        return await AdminModel.find();
    },

    findById: async (id) => {
        return await AdminModel.findById(id);
    },

    findByEmail: async (email) => {
        return await AdminModel.findOne({ email });
    },

    create: async (adminData) => {
        return await AdminModel.create(adminData);
    },

    updateById: async (id, updateData) => {
        return await AdminModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );
    }
};