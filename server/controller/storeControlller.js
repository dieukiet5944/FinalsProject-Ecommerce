import storeModel from "../model/store.js";
import crypto from 'crypto'

export const storeController = {
    getStore: async (req, res) => {
        try {
            const getAlldata = await storeModel.find({});

            if (getAlldata.length === 0) { { return res.status(404).json({ message: "Not found data !!!" }) } }

            res.status(200).send({
                success: true,
                message: `Success to log data`,
                data: getAlldata
            });
        } catch (error) {
            console.log("Error from server:", error.message);
            res.status(500).send({
                success: false,
                message: "Internal Server Error                         ",
                error: error.message
            });
        }

    },

    postStore: async (req, res) => {
        try {
            const { storeName, email, phone, address, description, ownerId, ownerName, staff, status } = req.body

            if (!storeName || !email || !phone || !address || !description || staff === undefined) {
                return res.status(400).send({
                    success: false,
                    message: "Please fill full all field !!!"
                });
            }

            const newStore = new storeModel({
                storeName,
                storeCode: `Store - ${crypto.randomUUID().slice(0, 5)}`,
                email,
                phone,
                address,
                staff,
                description,
                status,
                ownerId,
                ownerName
            })

            await newStore.save()

            res.status(201).send({
                success: true,
                message: `Create a new store "${storeName}" successful!`,
                data: newStore
            });

        } catch (error) {
            console.log("Error from server:", error.message);
            res.status(500).send({
                success: false,
                message: "Internal Server Error (Lỗi kết nối hoặc lưu Database)",
                error: error.message
            });
        }
    },

    updateStore: async (req, res) => {
        try {
            const { id } = req.params;
            const { storeName, email, address, phone, description, staff, status } = req.body;

            const updatedStore = await storeModel.findByIdAndUpdate(
                id,
                {
                    storeName: storeName?.trim(),
                    email: email?.trim(),
                    address: address?.trim(),
                    phone: phone?.trim(),
                    description: description?.trim(),
                    staff: Number(staff),
                    status: status?.trim()
                },
                { new: true, runValidators: true }
            );

            if (!updatedStore) {
                return res.status(404).json({
                    success: false,
                    message: "Store not found!"
                });
            }

            res.status(200).json({
                success: true,
                message: "Successfully updated store info",
                data: updatedStore
            });

        } catch (error) {
            console.error("Error in updateStore:", error);
            res.status(500).json({
                success: false,
                message: "Server error during update",
                error: error.message
            });
        }
    },

    deleteStore: async (req, res) => {
        try {
            const { id } = req.params;

            const deletedStore = await storeModel.findByIdAndDelete(id);

            if (!deletedStore) {
                return res.status(404).json({ success: false, message: "Store not found!" });
            }

            res.status(200).json({ success: true, message: "Successfully deleted store from DB" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}