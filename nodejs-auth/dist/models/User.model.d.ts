import mongoose from "mongoose";
declare const UserModel: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    username: string;
    email: string;
    password: string;
    role: "user" | "admin";
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    username: string;
    email: string;
    password: string;
    role: "user" | "admin";
}, {}, {
    timestamps: true;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    username: string;
    email: string;
    password: string;
    role: "user" | "admin";
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    username: string;
    email: string;
    password: string;
    role: "user" | "admin";
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    username: string;
    email: string;
    password: string;
    role: "user" | "admin";
}>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    username: string;
    email: string;
    password: string;
    role: "user" | "admin";
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default UserModel;
//# sourceMappingURL=User.model.d.ts.map