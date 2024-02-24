import {Router} from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import UsersModel from "@/models/UsersModel";
import {transporter} from "@/utils";
import usersModel from "@/models/UsersModel";


const SECRET_KEY = "1oic2oi1ensd0a9dicw121k32aspdojacs";
const authRouter = Router();

function generateToken(user: mongoose.Document) {
    return jwt.sign({userId: user._id, login: user.get("login"), role: user.get("role")}, SECRET_KEY, {expiresIn: '24h'});
}

function generateMailToken(length: number = 32): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        token += characters.charAt(randomIndex);
    }
    return token;
}

authRouter.get('/', (req, res, next) => {
    res.send('Auth page!');
})

authRouter.post('/login', async (req, res, next) => {
    const {login, password} = req.body;

    try {
        const user = await UsersModel.findOne({login, password});

        if (user) {
            const token = generateToken(user);
            res.json({token});
        } else {
            res.status(401).json({message: 'Invalid credentials'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Internal Server Error'});
    }

});

authRouter.post('/register', async (req, res) => {
    const {login, password} = req.body;

    if (!login || !password) {
        return res.status(400).json({message: 'Missing credentials'});
    }

    try {
        // Check if the user already exists
        const existingUser = await UsersModel.findOne({login: login});

        if (existingUser) {
            return res.status(409).json({message: 'User already exists'});
        }

        // Create a new user
        const newUser = new UsersModel({
            login: login,
            password: password,
            role: "student",
            validated: false,
            token: generateMailToken(32),
        });
        await newUser.save();


        await transporter.sendMail({
            from: "kuanyshmaximauth@gmail.com",
            to: login,
            subject: `Hello ${login}!`,
            text: `Your verification link is here! ${"https://express-frontend-university.vercel.app/auth/verify?token=" + newUser.get("token")}`,
        })


        const token = generateToken(newUser);

        res.status(201).json({token});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

authRouter.get("/verify", async (req, res) => {
    const token = req.query.token as string;

    if (!token) {
        return res.status(400).json({message: "Invalid token"});
    }

    const user = await usersModel.findOne({token: token});
    if (!user || user.validated) {
        return res.status(400).json({message: "User not found or already validated"});
    }
    user.validated = true;
    user.save();

    return res.status(301).redirect("/")
})

export default authRouter;