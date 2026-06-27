import 'dotenv/config';

import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose';

import usersRouter from './routers/usersRouter.js';
import productRouter from './routers/productsRouter.js';
import adminRouter from './routers/adminRouter.js';
import ordersRouter from './routers/ordersRouter.js';
import storeRouter from './routers/storeRouter.js';

const PORT = process.env.PORT || 8080;

const db_url = process.env.MONGODB_URL;

const app = express();

function myLogger(req, res, next) {
  console.log(`Received request for: ${req.url}`);
  next(); 
}

app.use(myLogger);

app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());

//USER
app.use("/users", usersRouter);

//PRODUCT
app.use("/products", productRouter);

//ORDER
app.use("/orders", ordersRouter)


//ADMIN 
app.use("/secret-key/admin", adminRouter);

//ADMIN 
app.use("/store", storeRouter);



const connectDatabase = async () => {
    try {
       
        await mongoose.connect(db_url);
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