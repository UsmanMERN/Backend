import { model, Schema } from "mongoose"

export enum Permissions {
    GENERAL = "GENERAL",
}

export interface ApiKeyDoc {
    key: string,
    version: number,
    permissions: Permissions[],
    status: boolean
}

const schema = new Schema<ApiKeyDoc>({
    key: {
        type: String,
        required: true,
        unique: true,
        maxlength: 1024,
        trim: true
    },
    version: {
        type: Number,
        required: true,
        min: 1,
        max: 100
    },
    permissions: {
        type: [{
            type: String,
            required: true,
            enum: Object.values(Permissions)
        }],
        required: true
    },
    status: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    timestamps: true
})

schema.index({ key: 1, status: 1 })

export const ApiKeyModel = model<ApiKeyDoc>("Apikey", schema, "apikeys")  