import express from 'express';
import mongoose from "mongoose";
import BooksModel from "@/models/BooksModel";
import authRouter from "@/auth/router";
import bodyParser from "body-parser";
import cors from "cors";
import jwt from "jsonwebtoken";
import {isAllowAccess} from "@/utils";
import UsersModel from "@/models/UsersModel";
import {DecodedToken} from "@/types";


const SECRET_KEY = "1oic2oi1ensd0a9dicw121k32aspdojacs";
const app = express();
const port = 5000;

async function main() {

    try {
        await mongoose.connect("mongodb://0.0.0.0:27017/mongo_university");
        app.listen(port);
        console.log(`Running on http://localhost:${port}`);
    } catch (err) {
        return console.log(err);
    }
}

app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));
app.use(cors())

app.get('/', (request, response) => {
    response.send('Main page!');
});


app.get("/books", async (request, response) => {
    let {page, limit} = request.query;
    if (!page || !limit) {
        response.send("Missing params")
        return;
    }



    const page_mongo = parseInt(page.toString());
    const limit_mongo = parseInt(limit.toString());

    const books = await BooksModel.find({}).skip((page_mongo - 1) * limit_mongo).limit(limit_mongo);
    response.send(books);
});

app.get("/books/:id", async (request, response) => {
    try {
        const book = await BooksModel.findById(request.params.id);
        if (book) {
            response.status(200).json(book);
        } else {
            response.status(400).json({message: "Book not found"});
        }
    } catch (err) {
        return response.status(400).json({message: "Invalid id"});
    }
});

app.post("/process_order", async (request, response) => {

    try {
        const {token, book_id} = request.body;
        console.log(token, book_id)
        const verification = jwt.verify(token, SECRET_KEY) as DecodedToken;
        const book = await BooksModel.findById(book_id);
        const user = await UsersModel.findById(verification.userId);

        if (!book) return response.status(400).json({message: "Book not found"});
        if (!user) return response.status(400).json({message: "User not found"});
        if (book.stock == 0) return response.status(400).json({message: "No stock"});

        const res = await UsersModel.aggregate([
            {
                $match: {
                    'issuances.book_id': book._id,
                },
            },
            {
                $unwind: '$issuances',
            },
            {
                $match: {
                    'issuances.book_id': book._id,
                },
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                },
            },
        ]).exec() 
        if ((user.role == "student" && res[0] && res[0].count >= 1) || (user.role == "teacher" && res[0] && res[0].count >= 3) ) {
            return response.status(400).json({message: `You have already taken this book ${res[0].count} times.`});
        }

        if (isAllowAccess(verification.role, book.stock)) {
            const date = new Date();
            date.setDate(date.getDate() + 7);

            await UsersModel.findByIdAndUpdate(
                verification.userId,
                {
                    issuances: [
                        ...user.issuances,
                        { book_id: book._id, due_date: date }
                    ]
                },

            )

            book.stock -= 1;
            await book.save();

            return response.status(200).json({message: "Order processed"});
        } else {
            return response.status(400).json({message: "No access"});
        }


    } catch (err) {
        console.log(err)
        return response.status(400).json({message: err});
    }
});

app.use("/auth", authRouter)

main()