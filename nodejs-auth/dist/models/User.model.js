import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });
const UserModel = mongoose.model("User", UserSchema);
export default UserModel;
//# sourceMappingURL=User.model.js.map