import express from 'express'
import {Book} from "../types/book";

const app = express();
const port = 5000;

app.get('/', (request, response) => {
    response.send('Hello world!');
});

app.listen(port, () => {
    console.log(`Running super-duper backend on port ${port}`)
});