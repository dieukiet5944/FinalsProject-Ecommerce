import express from 'express'
import cors from 'cors'
import mongoose from 'mongodb';

import usersRouter from './routers/usersRouter';
import productRouter from './routers/productsRouter';
import adminRouter from './routers/adminRouter';
import orderController from './controller/orderController';
import ordersRouter from './routers/ordersRouter';

const PORT = process.env.PORT || 8080;

const db_url = process.env.MONGODB_URL;

const app = express();

function myLogger(req, res, next) {
  console.log(`Received request for: ${req.url}`);
  next(); 
}

app.use(myLogger);

app.use(cors());

app.use(express.json());

//USER
app.use("/users", usersRouter);

//PRODUCT
app.use("/products", productRouter);

//ORDER
app.use("/orders", ordersRouter)


//ADMIN 
app.use("/secret-key/admin", adminRouter);



const connectDatabase = async () => {
    try {
       
        await mongoose.connect(url_db);
        console.log("=== Kết nối thành công tới MongoDB Atlas! ===");

        app.listen(PORT, () => {
            console.log(`Server đang chạy ổn định tại port ${PORT}!`);
        });

    } catch (error) {
        console.log("Xảy ra lỗi nghiêm trọng khi kết nối DB:");
        console.error(error.message);
        process.exit(1); 
    }
};


connectDatabase()