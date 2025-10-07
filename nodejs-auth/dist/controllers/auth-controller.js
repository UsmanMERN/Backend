import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/User.model.js";
const registerUser = async (req, res) => {
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
    }
    else {
        return res.status(500).json({ success: false, message: "Failed to register user" });
    }
};
const loginUser = async (req, res) => {
    const { username, password } = req.body;
    const isUserFound = await UserModel.findOne({ username });
    if (!isUserFound) {
        return res.status(400).json({ success: false, message: "Invalid username or password" });
    }
    if (isUserFound) {
        const isPasswordMatched = await bcrypt.compare(password, isUserFound.password);
        if (!isPasswordMatched) {
            return res.status(400).json({ success: false, message: "Invalid username or password" });
        }
        const payload = {
            userId: isUserFound._id,
            role: isUserFound.role,
            username: isUserFound.username,
            email: isUserFound.email
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
        return res.status(200).json({ success: true, message: "User logged in successfully", token });
    }
    return res.status(500).json({ success: false, message: "Failed to login user" });
};
export { registerUser, loginUser };
//# sourceMappingURL=auth-controller.js.map