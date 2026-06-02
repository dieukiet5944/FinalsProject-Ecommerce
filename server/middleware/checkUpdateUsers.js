import UserModel from "../model/users.js";

export const checkUpdateUsers = async (res, req, next) => {
    const { userId } = req.params;

    const { username, email, phone, status, avatar } = req.body;

    const updateFields = { username, email, phone, status, avatar };

    Object.keys(updateFields).forEach((key) => {
        if (updateFields[key] === undefined) {
            delete updateFields[key];
        }
    });

    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({
            message: "Vui lòng cung cấp ít nhất một thông tin cần cập nhật!"
        });
    }

    req.validatedUpdateData = updateFields;

    next();

}