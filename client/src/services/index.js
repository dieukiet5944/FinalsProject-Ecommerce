import express, { application, json, response } from 'express'
import cors from 'cors'
import { products, users } from './data.js';


const PORT = 8080; 

const app = new express();

app.use(cors()); //Same-Origin Policy.
app.use(express.json());

app.get('/products', (req, res) => {

    
    res.json(products);
})

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});