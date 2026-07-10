import UserModel from '../model/users.js';
import bcrypt from 'bcrypt'

export const checkloginUser = async (req,res,next) => {
    const {email, password} = req.body;

    if(!email || !password) {
        return res.status(400).json({
            message: "These email and password are required !!!  "
        })
    }

    const user = await UserModel.findOne({email});

    if(!user) {
        return res.status(404).json({
            message: "Email or password are note correct !!!"
        })
    }



    const checkpass = bcrypt.compareSync(password, user.password);

    if(!checkpass) {
        return res.status(404).json({
            message: "Email or password are note correct !!!"
        })
    }

    req.user = user;

    next();
}