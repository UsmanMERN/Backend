import mongoose from "mongoose";
const connectToDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            console.error("MONGO_URI is not defined in the environment variables");
            process.exit(1);
        }
        await mongoose.connect(mongoURI);
        console.log("Connected to the database");
    }
    catch (error) {
        console.error("Error connecting to the database", error);
        process.exit(1);
    }
};
export default connectToDB;
//# sourceMappingURL=db.js.map