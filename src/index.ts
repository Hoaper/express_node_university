import express from 'express';
import mongoose, {Types} from "mongoose";
import authRouter from "@/auth/router";
import bodyParser from "body-parser";
import cors from "cors";
import UsersModel from "@/models/UsersModel";
import booksRouter from "@/books/route";


const SECRET_KEY = "1oic2oi1ensd0a9dicw121k32aspdojacs";
const app = express();
const port = 80;

async function main() {

    try {
        await mongoose.connect("mongodb+srv://client:5423@golang.fcwced4.mongodb.net/db");
        app.listen(port);
        console.log(`Running on http://localhost:${port}`);
    } catch (err) {
        return console.log(err);
    }
}

app.use(bodyParser.json());
app.use(cors())

app.get('/', (request, response) => {
    response.send('Main page!');
});


app.get("/profile/:id", async (req, res) => {
    try {
        const user = await UsersModel.aggregate([
            {
                $match: { _id: new Types.ObjectId(req.params.id) },
            },
            {
                $unwind: "$issuances", // Unwind the issuances array
            },
            {
                $lookup: {
                    from: "books",
                    localField: "issuances.book_id",
                    foreignField: "_id",
                    as: "bookDetails",
                },
            },
            {
                $unwind: "$bookDetails", // Unwind the bookDetails array
            },
            {
                $project: {
                    _id: 0,
                    book_id: "$issuances.book_id",
                    due_date: "$issuances.due_date",
                    book: "$bookDetails",
                },
            },
        ])


        console.log(user)

        if (user) {
            res.status(200).json(user);
        } else {
            res.status(400).json({message: "User not found"});
        }
    } catch (err) {
        console.log(err)
        return res.status(400).json({message: "Invalid id"});
    }
})

app.use('/books', booksRouter);

app.use("/auth", authRouter)

main()