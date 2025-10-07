import type { Response, Request } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/User.model.js";



const registerUser = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    const checkExistingUser = await UserModel.findOne({ $or: [{ username }, { email }] });

    if (checkExistingUser) {
        return res.status(400).json({ success: false, message: "Username or Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
        username,
        email,
        password: hashedPassword
    });

    await newUser.save();

    if (newUser) {
        return res.status(201).json({ success: true, message: "User registered successfully" });
    } else {
        return res.status(500).json({ success: false, message: "Failed to register user" });
    }
}
const loginUser = async (req: Request, res: Response) => { }


export { registerUser, loginUser };