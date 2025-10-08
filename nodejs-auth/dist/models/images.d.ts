import mongoose from "mongoose";
declare const Image: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    url: string;
    publicId: string;
    uploadedAt: NativeDate;
    uploadedBy: mongoose.Types.ObjectId;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    url: string;
    publicId: string;
    uploadedAt: NativeDate;
    uploadedBy: mongoose.Types.ObjectId;
}, {}, {
    timestamps: true;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    url: string;
    publicId: string;
    uploadedAt: NativeDate;
    uploadedBy: mongoose.Types.ObjectId;
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
    url: string;
    publicId: string;
    uploadedAt: NativeDate;
    uploadedBy: mongoose.Types.ObjectId;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    url: string;
    publicId: string;
    uploadedAt: NativeDate;
    uploadedBy: mongoose.Types.ObjectId;
}>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    url: string;
    publicId: string;
    uploadedAt: NativeDate;
    uploadedBy: mongoose.Types.ObjectId;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default Image;
//# sourceMappingURL=images.d.ts.map