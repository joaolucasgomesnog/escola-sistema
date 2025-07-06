//ROTAS DE student
import autenticateToken from "../middleware/authenticateToken.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import student from "../modules/student/index.js";
import { Router } from "express";

const studentRoutes = Router();

studentRoutes.post('/logout/', autenticateToken, authorizeRoles('student'), student.logout);
studentRoutes.post('/create', autenticateToken, authorizeRoles('admin'), student.createStudent)
studentRoutes.post('/create-class-student', autenticateToken, authorizeRoles('admin'), student.createClassStudent)
studentRoutes.get('/get/:id', autenticateToken, authorizeRoles('admin', 'teacher'), student.getStudentById);
studentRoutes.get('/getall', autenticateToken, authorizeRoles('admin', 'teacher'), student.getAllStudents);
studentRoutes.get('/getall-by-course/:courseId', autenticateToken, authorizeRoles('admin', 'teacher'), student.getAllStudentsByCourseId);
studentRoutes.get('/getall-by-class/:classId', autenticateToken, authorizeRoles('admin', 'teacher'), student.getAllStudentsByClassId);
studentRoutes.get('/search', autenticateToken, authorizeRoles('admin', 'teacher'), student.searchStudents);
studentRoutes.put('/update/:id', autenticateToken, authorizeRoles('admin'), student.updateStudent);
studentRoutes.delete('/delete/:id', autenticateToken, authorizeRoles('admin'), student.deleteStudent);

export {studentRoutes}
