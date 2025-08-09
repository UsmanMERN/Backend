import { model, Schema } from "mongoose";
import type { UserDoc } from "./userModel.js";

export default interface KeyStoreDoc {
    _id: string,
    client: UserDoc,
    primaryKey: string,
    secondaryKey: string,
    status: boolean
}

const schema = new Schema<KeyStoreDoc>({
    client: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    primaryKey: {
        type: String,
        required: true,
        trim: true
    },
    secondaryKey: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: Boolean,
        default: true
    }
}, { timestamps: true, versionKey: false })

schema.index({ client: 1 })
schema.index({ client: 1, primaryKey: 1, status: 1 })
schema.index({ client: 1, secondaryKey: 1 })

export const KeyStoreModel = model<KeyStoreDoc>('keystore', schema)