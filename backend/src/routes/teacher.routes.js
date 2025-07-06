//ROTAS DE teacher
import autenticateToken from "../middleware/authenticateToken.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import teacher from "../modules/teacher/index.js";
import { Router } from "express";

const teacherRoutes = Router();

teacherRoutes.post('/logout/', autenticateToken, authorizeRoles('teacher'), teacher.logout);
teacherRoutes.post('/create', autenticateToken, authorizeRoles('admin'), teacher.createTeacher)
teacherRoutes.get('/get/:id', autenticateToken, authorizeRoles('admin'), teacher.getTeacherById);
teacherRoutes.get('/getall', autenticateToken, authorizeRoles('admin'), teacher.getAllTeachers);
teacherRoutes.get('/getall-by-course/:courseId', autenticateToken, authorizeRoles('admin'), teacher.getAllTeachersByCourseId);
teacherRoutes.put('/update/:id', autenticateToken, authorizeRoles('admin'), teacher.updateTeacher);
teacherRoutes.delete('/delete/:id', autenticateToken, authorizeRoles('admin'), teacher.deleteTeacher);

export {teacherRoutes}
