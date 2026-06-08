import UserModel from "../model/users.js"

export const checkRegisterUser = async (req, res, next) => {
        const { email } = req.body

        if ( !email ) {
            return res.status(400).json({
                message: "This field required!!!"
            })
        }

        const user = await UserModel.findOne({email});

        if(user) {
            return res.status(200).json({
                message: "Email's existed"
            })
        }

        next()
}