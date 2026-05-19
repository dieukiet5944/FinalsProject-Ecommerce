import AdminModel from "../model/admin";

const adminController = {
    getAdmin: async (req, res) => {
        try {

            const response = await AdminModel.find({});

            if (!response) throw new Error(" Can't get data from database");

            return res.status(200).send({
                success: true,
                message: "Successful catch this data admin",
                data: response
            })

        }
        catch (error) {
            console.log("Error", error.message)
            res.status(500).send({
                success: false,
                message: "Internal Server Error",
                error: error.message
            })
        }
    }
}

export default adminController