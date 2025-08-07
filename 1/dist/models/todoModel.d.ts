import { Document, Model, Schema } from "mongoose";
export interface Todo extends Document {
    user: Schema.Types.ObjectId;
    title: string;
    description: string;
    status: string;
}
export declare enum STATUS {
    NOT_STARTED = "NOT_STARTED",
    IN_PROGRESS = "IN_PROGRESS",
    DONE = "DONE"
}
declare const Todo: Model<Todo>;
export default Todo;
//# sourceMappingURL=todoModel.d.ts.map