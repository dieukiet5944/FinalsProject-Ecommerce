import express from 'express'
import { storeController } from '../controller/storeControlller.js';

const storeRouter = express.Router();

storeRouter.get("/", storeController.getStore);
storeRouter.post("/", storeController.postStore);
storeRouter.put("/:id", storeController.updateStore);
storeRouter.delete("/:id", storeController.deleteStore);

export default storeRouter