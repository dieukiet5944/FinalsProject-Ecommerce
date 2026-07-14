import { sepayService } from "../services/sepayService.js";
import { catchAsync } from "../utils/catchAsync.js";

export const handleSepayWebhook = catchAsync( async (req, res) => {
        const { code, content, transferAmount } = req.body; 

        await sepayService.processWebhook({ code, content, transferAmount });
        
        return res.status(200).json({ 
            success: true, 
            message: "Webhook processed successfully" 
        });
});