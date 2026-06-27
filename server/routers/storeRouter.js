import express from 'express'
import { storeController } from '../controller/storeControlller.js';

const storeRouter = express.Router();

storeRouter.post("/", storeController.postStore);

export default storeRouter