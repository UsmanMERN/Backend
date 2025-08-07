import { Document, Model } from "mongoose";
export interface UserDoc extends Document {
    name?: string;
    email?: string;
    password?: string;
    matchPassword?: (enteredPasword: string) => Promise<boolean>;
}
declare const User: Model<UserDoc>;
export default User;
//# sourceMappingURL=userModel.d.ts.map