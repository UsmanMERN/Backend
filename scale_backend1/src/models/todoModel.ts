import mongoose, { Document, Model, Schema } from "mongoose"


export interface Todo extends Document {
  user: Schema.Types.ObjectId,
  title: string,
  description: string,
  status: string
}

export enum STATUS {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE"
}

const COLLECTION_NAME = "todos"


const todoModel = new Schema<Todo>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: STATUS.NOT_STARTED,
      enum: Object.values(STATUS),
    },
  },
  {
    timestamps: true,
  }
)

const Todo: Model<Todo> = mongoose.model<Todo>("Todo", todoModel, COLLECTION_NAME)

export default Todo
