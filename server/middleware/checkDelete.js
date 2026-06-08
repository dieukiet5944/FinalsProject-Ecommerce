import UserModel from "../model/users.js";
import AdminModel from "../model/admin.js";

export const checkDeleteUser = async (req, res, next) => {
    const { id } = req.params;

    const { refreshToken } = req.body;

    if (!id) { return res.status(403).json({ message: "ID's required" }) }

    const user = await UserModel.findById(id);

    if (!user) {
        return res.status(403).json({
            message: "This User's ID is not valid"
        })
    }

    const admin = await AdminModel.findOne({refreshToken});

    if (!admin || !refreshToken) {
        return res.status(403).json({
            message: "You cannot delete. If you are not the Admin"
        })
    }

    if(!user.refreshToken){
        return res.status(403).json({
            message: "User isn't Authentiaciton !!"
        })
    }

    req.userDelete = user;

    next()

}