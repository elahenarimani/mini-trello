import { Router } from "express";
import { createTaskController, deleteTaskController, getTaskController, getTasksController, replaceTaskController, updateTaskController } from "../controllers/task.controller.js";

const router = Router();

router.get("/", getTasksController);
router.get("/:id", getTaskController);
router.post("/", createTaskController);
router.put("/:id", replaceTaskController);
router.patch("/:id", updateTaskController);
router.delete("/:id", deleteTaskController);

export default router;
