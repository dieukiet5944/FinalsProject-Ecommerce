import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import router from './api.js';


const PORT = process.env.PORT || 8080;

const app = express();

app.use(cors());

app.use(express.json());

app.use("/", router);

app.listen(PORT, () => {
    console.log(`[0] Server is running on http://localhost:${PORT}`);
});