import UserModel from "../model/users.js";

export const userRepository = {
    findById: async (id) => {
        return await UserModel.findById(id);
    },

    findByEmail: async (email) => {
        return await UserModel.findOne({ email });
    },

    create: async (userData) => {
        return await UserModel.create(userData);
    },

    updateById: async (id, updateData) => {
        return await UserModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { returnDocument: 'after' }
        );
    },

    deleteById: async (id) => {
        return await UserModel.findByIdAndDelete(id);
    },

    findAll: async () => {
        return await UserModel.find({});
    }
};