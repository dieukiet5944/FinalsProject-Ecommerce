import mongoose from 'mongoose'


const userSchema = new mongoose.Schema({
    id: { 
        type: String, 
        required: true, 
        unique: true 
    },
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    full_name: { 
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
        enum: ["customer", "admin"], 
        default: "customer" 
    },
    status: { 
        type: String, 
        enum: ["online", "offline"], 
        default: "offline" 
    },
    avatar: { 
        type: String, 
        default: "" 
    },
    last_active: { 
        type: Date, 
        default: Date.now 
    }
}, { 
    timestamps: true 
});

const UserModel = mongoose.model("users", userSchema);

export default UserModel;