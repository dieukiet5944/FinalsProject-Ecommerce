import express from "express";
import promotionController from "../controller/promotionController.js";

const promoRouter = express.Router();

promoRouter.post("/validate", promotionController.validatePromo);

promoRouter.get("/", promotionController.getAllPromos);
promoRouter.post("/create", promotionController.createPromo);
promoRouter.put("/update/:id", promotionController.updatePromo);
promoRouter.delete("/delete/:id", promotionController.deletePromo);

export default promoRouter;