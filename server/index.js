import env from './config/env.js'; 

import express from 'express';
import { errorHandler } from './middleware/errorHandler.js';
import cors from 'cors';
import mongoose from 'mongoose';
import mongoSanitize from 'express-mongo-sanitize';

import usersRouter from './routers/usersRouter.js';
import productRouter from './routers/productsRouter.js';
import adminRouter from './routers/adminRouter.js';
import ordersRouter from './routers/ordersRouter.js';
import storeRouter from './routers/storeRouter.js';
import promoRouter from './routers/promotionRouter.js';
import reviewRouter from './routers/reviewRouter.js';
import cartRouter from './routers/cartRouter.js';

import { globalLimiter } from './middleware/rateLimiter.js';

const app = express();

function myLogger(req, res, next) {
  console.log(`Received request for: ${req.url}`);
  next(); 
}
app.use(myLogger);

const allowedOrigins = [
  'http://localhost:5173', 
  env.FRONTEND_URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true 
}));

app.use(express.json());
app.use(mongoSanitize());
app.use(globalLimiter);

app.use("/users", usersRouter);
app.use("/products", productRouter);
app.use("/orders", ordersRouter);
app.use("/secret-key/admin", adminRouter);
app.use("/store", storeRouter);
app.use('/promotions', promoRouter);
app.use('/reviews', reviewRouter);
app.use('/cart', cartRouter);

app.use(errorHandler);

const connectDatabase = async () => {
    try {
        await mongoose.connect(env.MONGODB_URL);
        console.log("=== Connection to MongoDB Atlas successful! ===");

        app.listen(env.PORT, () => {
            console.log(`The server is running stably at port ${env.PORT}!`);
        });
    } catch (error) {
        console.log("A serious error occurred while connecting to the DB:");
        console.error(error.message);
        process.exit(1); 
    }
};

connectDatabase();