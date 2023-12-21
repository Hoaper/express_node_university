import express from 'express';
import mongoose, {Types} from "mongoose";
import authRouter from "@/auth/router";
import bodyParser from "body-parser";
import cors from "cors";
import UsersModel from "@/models/UsersModel";
import booksRouter from "@/books/route";


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
app.use(cors())

app.get('/', (request, response) => {
    response.send('Main page!');
});


app.get("/profile/:id", async (req, res) => {
    //{
    //     book_id: new ObjectId('657dea85f1b193d65aabff28'),
    //     due_date: 2023-12-28T09:30:03.845Z,
    //     book: {
    //       _id: new ObjectId('657dea85f1b193d65aabff28'),
    //       image: 'https://cdn.f.kz/prod/786/785876_550.jpg',
    //       title: 'Спеши любить',
    //       description: 'Тихий городок Бофор.\r\n' +
    //         'Каждый год Лэндон Картер приезжает сюда, чтобы вспомнить историю своей первой любви...\n' +
    //         '\r\n' +
    //         'Историю страсти и нежности, много лет назад связавшей его, парня из богатой семьи, и Джейми Салливан, скромную дочь местного пастора.\n' +
    //         '\r\n' +
    //         'История радости и грусти, счастья и боли.\n' +
    //         '\r\n' +
    //         'Историю чувства, которое человеку доводится испытать лишь раз в жизни — и запомнить навсегда...\n',
    //       author: 'Н. Спаркс',
    //       rating: 4.9,
    //       pages: 224,
    //       languages: 'русский',
    //       date: 2016,
    //       category: 'Художественная литература',
    //       stock: 3,
    //       validUntil: 2033-12-18T13:34:18.053Z
    //     }
    //}

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