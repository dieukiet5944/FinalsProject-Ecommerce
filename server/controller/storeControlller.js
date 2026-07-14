import { storeService } from "../service/storeService.js";
import { catchAsync } from "../utils/catchAsync.js";

export const storeController = {
    getStore: catchAsync( async (req, res) => {
            const stores = await storeService.getAllStores();

            return res.status(200).send({
                success: true,
                message: "Success to log data",
                data: stores
            });
    }),

    postStore: catchAsync( async (req, res) => {
            

            const newStore = await storeService.createStore(req.body);
            return res.status(201).send({
                success: true,
                message: `Create a new store "${storeName}" successful!`,
                data: newStore
            });
    }),

    updateStore: catchAsync( async (req, res) => {
            const { id } = req.params;

            const updatedStore = await storeService.updateStore(id, req.body);

            return res.status(200).json({
                success: true,
                message: "Successfully updated store info",
                data: updatedStore
            });
    }),

    deleteStore: catchAsync( async (req, res) => {
            const { id } = req.params;

            await storeService.deleteStore(id);

            return res.status(200).json({ 
                success: true, 
                message: "Successfully deleted store from DB" 
            });
    })
};