import { jwtHelper } from "../utils/jwt";


export const checkValidCart = async (req, res, next) => {

    const { refreshToken, items, userId} = req.body

    if(!refreshToken || !items | !userId) {
        return res.status(403).json({
            message: "All fields is requirerd!!!"
        })
    }


    const decode = jwtHelper.verifyRefreshToken(refreshToken);

    if(decode._id !== userId){
         return res.status(404).json({
            message: "This user is not authentication !!!"
         })
    }


    next()
}