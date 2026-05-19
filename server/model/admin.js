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
        type: Number,
        required: true,
        unique: true
    },
    role:{
        type: String,
        required: true,
    },
    phoneNumber:{
        type: String,
        require: true,
        unique: true
    }
})

const AdminModel = mongoose.model("admin", adminSchema);

export default AdminModel;