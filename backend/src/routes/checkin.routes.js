
import CheckIn from "../modules/CheckIn/index.js"
import { Router } from "express";

const checkInRoutes = Router();

checkInRoutes.post("/", CheckIn.createCheckIn)
checkInRoutes.get("/user/:id", CheckIn.findAllCheckInsByUser)
checkInRoutes.get("/:id", CheckIn.findCheckInById)
checkInRoutes.get("/date/:date", CheckIn.findAllCheckInsByDate)
checkInRoutes.put("/:id", CheckIn.updateCheckIn)
checkInRoutes.delete("/:id", CheckIn.deleteCheckIn)


export {checkInRoutes}