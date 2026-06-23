import mongoose from 'mongoose'


const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true },
    phone: { 
        type: String, 
        required: true },
    role: { 
        type: String, 
        enum: ["user", "admin"], 
        default: "user" 
    },
    status: { 
        type: String, 
        enum: ["online", "offline"], 
        default: "offline" 
    },
    avatar: { 
        type: String, 
        default: "none-avt.png" 
    },
    refreshToken: {
        type: String,
    }
},{ 
    timestamps: true
});

const UserModel = mongoose.model("users", userSchema);

export default UserModel;