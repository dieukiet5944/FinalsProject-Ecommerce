import { storeRepository } from "../repositories/storeRepository.js";
import crypto from 'crypto';

export const storeService = {
    
    getAllStores: async () => {
        const stores = await storeRepository.findAll();
        if (stores.length === 0) {
            throw new Error("STORE_NOT_FOUND");
        }
        return stores;
    },

    createStore: async (storeData) => {
        const { storeName, email, phone, address, description, ownerId, ownerName, staff, status } = storeData;

        const storeCode = `Store - ${crypto.randomUUID().slice(0, 5)}`;

        const newStore = new storeRepository.create({
            storeName,
            storeCode,
            email,
            phone,
            address,
            staff,
            description,
            status,
            ownerId,
            ownerName
        });

        await newStore.save();
        return newStore;
    },

    updateStore: async (id, updateData) => {
        const { storeName, email, address, phone, description, staff, status } = updateData;

        const updateFields = {
            storeName: storeName?.trim(),
            email: email?.trim(),
            address: address?.trim(),
            phone: phone?.trim(),
            description: description?.trim(),
            staff: staff !== undefined ? Number(staff) : undefined,
            status: status?.trim()
        };

        Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

        const updatedStore = await storeRepository.updateById(
            id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updatedStore) {
            throw new Error("STORE_NOT_FOUND");
        }

        return updatedStore;
    },

    deleteStore: async (id) => {
        const deletedStore = await storeRepository.deleteById(id);
        if (!deletedStore) {
            throw new Error("STORE_NOT_FOUND");
        }
        return deletedStore;
    }
};