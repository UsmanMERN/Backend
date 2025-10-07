import express from "express";
import { config } from "dotenv";
import connectToDB from "./database/db.js";


config();
connectToDB();

const app = express();
const PORT = process.env.PORT;

// middleware

app.use(express.json());

import authRoutes from "./routes/auth-route.js";
import homeRoutes from "./routes/home-routes.js";

app.use("/api/auth", authRoutes);
app.use("/api", homeRoutes);


app.get("/", (req, res) => {
    res.json({ success: true, message: "API is working" });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});