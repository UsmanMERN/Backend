import express from "express"
import {
  createTodo,
  getTodos,
  editTodo,
  deleteTodo,
} from "../controllers/todoController.js"
import { protect } from "../middleware/authMiddleware.js"
import apikey from "../auth/apikey.js"
import permission from "../helpers/permission.js"

const router = express.Router()

// router.use(findByKey)
router.use(apikey)
router.use(permission)


router.route("/").post(protect, createTodo).get(getTodos)
router.route("/:id").put(protect, editTodo).delete(protect, deleteTodo)

export default router
