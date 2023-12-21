import mongoose from "mongoose";

const validatorSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    pages: {
        type: Number,
        required: true,
    },
    languages: {
        type: String,
        required: true,
    },
    date: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    validUntil: {
        type: Date,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
    },
});

const BooksModel = mongoose.model('books', validatorSchema);
export default BooksModel;