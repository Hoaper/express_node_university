import express from "express";
import BooksModel from "@/models/BooksModel";
import jwt from "jsonwebtoken";
import {DecodedToken} from "@/types";
import UsersModel from "@/models/UsersModel";
import {isAllowAccess} from "@/utils";

const SECRET_KEY = "1oic2oi1ensd0a9dicw121k32aspdojacs";
const booksRouter = express.Router();
booksRouter.get("/", async (request, response) => {
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

booksRouter.post("/process_order", async (request, response) => {

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

booksRouter.get("/almost", async (req, res) => {
    try {
        const books = await BooksModel.find({ stock: { $gte: 3, $lte: 6 } }).limit(5);
        res.status(200).json(books);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

booksRouter.get("/top_rating", async (req, res) => {
    try {
        const books = await BooksModel.find({ rating: { $gte: 4.9 } }).sort({ rating: -1 }).limit(5);
        res.json(books);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

booksRouter.get("/book/:id", async (request, response) => {
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

export default booksRouter;