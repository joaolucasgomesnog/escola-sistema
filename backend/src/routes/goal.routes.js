
import Goal from "../modules/Goal/index.js";
import { Router } from "express";

const goalRoutes = Router();

goalRoutes.post("/", Goal.createGoal)
goalRoutes.put("/:id", Goal.updateGoal)
goalRoutes.get("/list/:id", Goal.getAllGoalsByUser)
goalRoutes.delete("/:id", Goal.deleteGoalById)
goalRoutes.delete("/list/:id", Goal.deleteAllGoalsByUser)


export {goalRoutes}