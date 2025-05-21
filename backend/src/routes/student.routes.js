//ROTAS DE ADMIN
import autenticateToken from "../middleware/authenticateToken.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import student from "../modules/student/index.js";
import { Router } from "express";

const studentRoutes = Router();

studentRoutes.post('/login', student.login)
studentRoutes.post('/logout/', autenticateToken, authorizeRoles('student'), student.logout);
studentRoutes.post('/create', autenticateToken, authorizeRoles('admin'), student.createStudent)
studentRoutes.get('/get/:id', autenticateToken, authorizeRoles('admin'), student.getStudentById);
studentRoutes.get('/getall', autenticateToken, authorizeRoles('admin'), student.getAllStudents);
studentRoutes.put('/update/:id', autenticateToken, authorizeRoles('admin'), student.updateStudent);
studentRoutes.delete('/delete/:id', autenticateToken, authorizeRoles('admin'), student.deleteStudent);

export {studentRoutes}
