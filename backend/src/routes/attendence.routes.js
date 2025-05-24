import autenticateToken from "../middleware/authenticateToken.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import attendence from "../modules/attendence/index.js";
import { Router } from "express";

const attendenceRoutes = Router();

attendenceRoutes.post("/create", autenticateToken, authorizeRoles("teacher") ,attendence.createAttendences)
attendenceRoutes.get("/getall/student/:student_id", autenticateToken, authorizeRoles("teacher"), attendence.getAttendencesByStudentId)

//filtra as presenças por class e  date
attendenceRoutes.get("/getall/class-date", autenticateToken, authorizeRoles("teacher"), attendence.getAttendencesByClassDate)
attendenceRoutes.delete("/delete/:id", autenticateToken, authorizeRoles("teacher"), attendence.deleteAttendenceById)

export {attendenceRoutes}