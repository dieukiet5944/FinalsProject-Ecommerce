import AdminModel from "../model/admin.js";
import bcrypt from 'bcrypt'

export const checkloginAD = async (req,res,next) => {
    const {email, password} = req.body;

    if(!email || !password) {
        return res.status(400).json({
            message: "These email and password are required !!!  "
        })
    }

    const admin = await AdminModel.findOne({email});

    if(!admin) {
        return res.status(404).json({
            message: "wrong email !!!"
        })
    }



    const checkpass = bcrypt.compareSync(password, admin.password);

    if(!checkpass) {
        return res.status(404).json({
            message: "wrong password !!!"
        })
    }

    req.admin = admin;

    next();
}