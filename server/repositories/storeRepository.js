import storeModel from "../model/store.js";

export const storeRepository = {
    findAll: async () => {
        return await storeModel.find({});
    },

    findById: async (id) => {
        return await storeModel.findById(id);
    },

    create: async (storeData) => {
        const newStore = new storeModel(storeData);
        return await newStore.save();
    },

    updateById: async (id, updateFields) => {
        return await storeModel.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );
    },

    deleteById: async (id) => {
        return await storeModel.findByIdAndDelete(id);
    }
};