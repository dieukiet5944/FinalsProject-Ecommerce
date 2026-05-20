import mongoose from 'mongoose'


const adminSchema = new mongoose.Schema({
    id:{
        type: String,
        required: true,
        unique: true
    },
    userName:{
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
    }
},{ 
    timestamps: true 
});

const AdminModel = mongoose.model("admin", adminSchema, "admin");

export default AdminModel;