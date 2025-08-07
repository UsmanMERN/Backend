import mongoose, { Document, Model, Schema } from "mongoose";
export var STATUS;
(function (STATUS) {
    STATUS["NOT_STARTED"] = "NOT_STARTED";
    STATUS["IN_PROGRESS"] = "IN_PROGRESS";
    STATUS["DONE"] = "DONE";
})(STATUS || (STATUS = {}));
const COLLECTION_NAME = "todos";
const todoModel = new Schema({
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
}, {
    timestamps: true,
});
const Todo = mongoose.model("Todo", todoModel, COLLECTION_NAME);
export default Todo;
//# sourceMappingURL=todoModel.js.map