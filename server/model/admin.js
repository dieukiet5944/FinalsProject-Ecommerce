import mongoose from 'mongoose'


const adminSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    role:{
        type: String,
        required: true,
    },
    phoneNumber:{
        type: String,
        required: true,
        unique: true
    },
    avatar: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        default: "active"
    },
    refreshToken: {
        type: String,
    }
},{ 
    timestamps: true 
});

const AdminModel = mongoose.model("admin", adminSchema, "admin");

export default AdminModel;