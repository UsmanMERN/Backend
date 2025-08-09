import mongoose from "mongoose";
import { ApiKeyModel, Permissions } from "../models/ApiKeyModel.js"; // adjust the path to your schema file
import crypto from "crypto";

// MongoDB connection URI
const MONGO_URI = "mongodb+srv://usman:scalebackend@cluster0.u0wqzi1.mongodb.net/scaleBackend";

// Function to seed a sample API key
async function seedApiKey() {
    try {
        // 1. Connect to MongoDB
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // 2. Generate a secure random API key string
        const generatedKey = crypto.randomBytes(32).toString("hex"); // 64-char hex string

        // 3. Create the sample API key document
        const sampleApiKey = new ApiKeyModel({
            key: generatedKey,
            version: 1,
            permissions: [Permissions.GENERAL], // Using the enum
            status: true,
        });

        // 4. Save the document to the collection
        await sampleApiKey.save();
        console.log("✅ Sample API key seeded successfully:");
        console.log({
            key: generatedKey,
            version: 1,
            permissions: [Permissions.GENERAL],
            status: true,
        });
    } catch (error) {
        console.error("❌ Error seeding API key:", error);
    } finally {
        // 5. Close the MongoDB connection
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
}

// Run the seeding function
await seedApiKey();
