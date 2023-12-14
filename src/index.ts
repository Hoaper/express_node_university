import express from 'express'

const app = express();
const port = 5000;

interface Book {
    id: number;
    title: string;
    year: number;

}

const book = {

};

app.get('/', (request, response) => {
    response.send('Hello world!');
});
app.listen(port, () => {
    console.log(`Running super-duper backend on port ${port}`)
});