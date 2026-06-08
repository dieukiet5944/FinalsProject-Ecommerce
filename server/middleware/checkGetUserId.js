import UserModel from "../model/users.js";

export const checkGetUserId = async (req, res, next) => {
      const { id} = req.params;

      const {refreshToken} = req.body;


      if(!id || !refreshToken)  {
          return res.status(403).json({
             message: "ID & Token are required "
          })
      }

      const user = await UserModel.findById(id);

      if(!user) {
          return res.status(403).json({
             message: "This User's id is not exist "
          })
      }

      if(!user.refreshToken){
         return res.status(403).json({
            messsage: `The user with ID : ${user._id} is not authentication`
         })
      }

      req.getuserid = user ;
       
      next();
}