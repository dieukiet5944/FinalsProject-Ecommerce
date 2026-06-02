import OrderModel from "../model/order.js";
import ProductModel from "../model/products.js";

export const checkOrder = async (req, res, next) => {
    const { productId, quantity} = req.body 

    if(!productId || quantity === undefined) {
        return res.status(400).json({
            message: "This field required !!! "
        })
    }

    const product = await ProductModel.findById(productId)
    
    if(!product) {
        return res.status(404).json({
            message: "This checkIdProduct is invalid !!! "
        })
    }

    if(!quantity || quantity === 0 || quantity > product.quantity) {
        return res.status(403).json({
            message: "This quantiy need gather than 0 or less than stock"
        })
    }

    req.product = product;

    next();
}