import mongoose from 'mongoose'

const storeSchema = new mongoose.Schema(
    {
        storeName: {
            type: String,
            required: true
        },        
        storeCode: {
            type: String,
            required: true,
            unique: true
        },        
        ownerId: {
            type: String,
            required: true,
            default: "None"
        },          
        ownerName: {
            type: String,
            required: true,
            default: "None"
        },  
        email: {
            type: String,
            required: true
        },  
        phone: {
            type: String,
            required: true
        },  
        address: {
            province: String,
            district: String,
            ward: String,
            detailAddress: String
        },
        logo: {
            type: String,
            required: true,
            default:"none.jpg"
        },  
        // banner: {
        //     type: String,
        //     required: true
        // },  

        description: {
            type: String,
            required: true
        },          
        status: {
            type: String,
            required: true,
            enum: ["Open", "Close"],
            default: "Close"
        },             

        // isVerified: Boolean,      

        // totalProducts: Number,

        // totalOrders: Number,

        // totalRevenue: Number,

        // ratingAverage: Number,
    },{
        timestamps: true
    }
)

const storeModel = mongoose.model("store", storeSchema, "store")

export default storeModel