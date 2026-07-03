import UserModel from "../model/users.js";

export const checkUpdateUsers = async (req, res, next) => {
    const {id} = req.params;

    if(!id) { return res.status(403).json({ message: "ID's required"})}

    const { username, email, phone, status, avatar, refreshToken } = req.body;


    const user = await UserModel.findById(id);

    if(!user){
        return res.status(403).json({
            message: "This User id is not valid !!!"
        })
    }

    if(!user.refreshToken){
        return res.status(403).json({
            message: "User isn't Authentiaciton !!"
        })
    }

    const updateFields = { username, email, phone, status, avatar };

    Object.keys(updateFields).forEach((key) => {
        if (updateFields[key] === undefined || updateFields[key] === null || updateFields[key] === "") {
            delete updateFields[key];
        }
    });

    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({
            message: "Vui lòng cung cấp ít nhất một thông tin cần cập nhật!"
        });
    }

    req.userUpdate = user;

    req.validatedUpdateData = updateFields;

    next();

}