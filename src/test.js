const request = require('supertest');

const URL= 'http://localhost';
describe('GET /', () => {
    it('responds with text "Main page!"', (done) => {
        request(URL)
            .get('/')
            .expect(200)
            .expect('Main page!', done);
    });
    it('login failure', (done) => {
        request(URL)
            .post("/auth/login")
            .expect(401)
            .expect({message: "Invalid credentials"}, done);
    })
    it('login success', (done) => {
        request(URL)
            .post("/auth/login")
            .send({login: "220771@astanait.edu.kz", password: "123asd"})
            .expect(200, done)
    })
    it('get user info', (done) => {
        request(URL)
            .get("/profile/65d887d9d6fd46124553f714")
            .expect(200, done)
    })
    it('process order', (done) => {
        request(URL)
            .post("/books/process_order")
            .send({book_id: "657dea85f1b193d65aac0089", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWQ5NzVkMjQ0ZTdjOTAwZDc3NzlhYTgiLCJsb2dpbiI6IjIyMDc3MjFAYXN0YW5haXQuZWR1Lmt6Iiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3MDkwMTI0ODQsImV4cCI6MTcwOTA5ODg4NH0.OGYcgQg4xkQy3zXKWAX5UUkecheLFCIjMt0BQWhSHEo"})
            .expect(400)
            .expect({message: "You have already taken this book 1 times."}, done)
    })
});