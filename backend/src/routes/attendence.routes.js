import autenticateToken from "../middleware/authenticateToken.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import attendence from "../modules/attendence/index.js";
import { Router } from "express";

const attendenceRoutes = Router();

attendenceRoutes.post("/create", autenticateToken, authorizeRoles("teacher") ,attendence.createAttendence)
attendenceRoutes.get("/getall/:student_id", autenticateToken, authorizeRoles("teacher"), attendence.getAttendencesByStudentId)
attendenceRoutes.delete("/delete/:id", autenticateToken, authorizeRoles("teacher"), attendence.deleteAttendenceById)

export {attendenceRoutes}