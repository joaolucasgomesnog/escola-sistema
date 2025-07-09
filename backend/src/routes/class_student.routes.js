//ROTAS DE ADMIN
import autenticateToken from "../middleware/authenticateToken.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import classStudent from "../modules/classStudent/index.js";
import { Router } from "express";

const classeStudentRoutes = Router();

classeStudentRoutes.delete('/delete/:classId/:studentId', autenticateToken, authorizeRoles('admin'), classStudent.deleteClassStudent);

export {classeStudentRoutes}
