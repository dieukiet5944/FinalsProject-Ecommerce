import 'dotenv/config';

import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose';
import mongoSanitize from 'express-mongo-sanitize';

import usersRouter from './routers/usersRouter.js';
import productRouter from './routers/productsRouter.js';
import adminRouter from './routers/adminRouter.js';
import ordersRouter from './routers/ordersRouter.js';
import storeRouter from './routers/storeRouter.js';
import promoRouter from './routers/promotionRouter.js'
import reviewRouter from './routers/reviewRouter.js';
import cartRouter from './routers/cartRouter.js';

import { globalLimiter } from './middleware/rateLimiter.js';

const PORT = process.env.PORT || 8080;

const db_url = process.env.MONGODB_URL;

const app = express();

function myLogger(req, res, next) {
  console.log(`Received request for: ${req.url}`);
  next(); 
}


app.use(myLogger);

const allowedOrigins = [
  'http://localhost:5173', 
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true 
}));

app.use(express.json());


app.use(mongoSanitize());

//Global limiting
app.use(globalLimiter);

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

//PROMOTION
app.use('/promotions', promoRouter);

//REVIEW
app.use('/reviews', reviewRouter)

//CART
app.use('/cart', cartRouter)



const connectDatabase = async () => {
    try {
       
        await mongoose.connect(db_url);
        console.log("=== Connection to MongoDB Atlas successful! ===");

        app.listen(PORT, () => {
            console.log(`The server is running stably at port ${PORT}!`);
        });

    } catch (error) {
        console.log("A serious error occurred while connecting to the DB:");
        console.error(error.message);
        process.exit(1); 
    }
};


connectDatabase()