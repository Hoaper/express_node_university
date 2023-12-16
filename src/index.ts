import express from 'express';
import BooksModel from "../models/BooksModel";
import mongoose from "mongoose";

const app = express();
const port = 5000;

async function main() {

    try{
        await mongoose.connect("mongodb://0.0.0.0:27017/mongo_university");
        app.listen(port);
        console.log(`Running on http://localhost:${port}`);
    }
    catch(err) {
        return console.log(err);
    }
}

app.get('/', (request, response) => {
    response.send('Hello world!');
});

app.get("/db", async (request, response) => {
    const books = await BooksModel.find({});
    response.send(books);

});

main()