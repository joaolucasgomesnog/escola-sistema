//ROTAS DE ADMIN
import autenticateToken from "../middleware/authenticateToken.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import classe from "../modules/classe/index.js";
import { Router } from "express";

const classeRoutes = Router();

classeRoutes.post('/create', autenticateToken, authorizeRoles('admin'), classe.createClass)
classeRoutes.get('/get/:code', autenticateToken, authorizeRoles('admin', 'teacher', 'student'), classe.getClassByCode);
classeRoutes.get('/get-by-id/:id', autenticateToken, authorizeRoles('admin', 'teacher', 'student'), classe.getClassById);
classeRoutes.get('/getall', autenticateToken, authorizeRoles('admin', 'teacher', 'student'), classe.getAllClasses);
classeRoutes.get('/getallavailable/:student_id?', autenticateToken, authorizeRoles('admin', 'teacher', 'student'), classe.getAllAvailableClasses);
classeRoutes.get('/getall/teacher/:teacher_id', autenticateToken, authorizeRoles('admin', 'teacher'), classe.getAllClassesByTeacherId);
classeRoutes.put('/update/:id', autenticateToken, authorizeRoles('admin'), classe.updateClass);
classeRoutes.put('/add-teacher', autenticateToken, authorizeRoles('admin'), classe.addTeacher);
classeRoutes.put('/delete-teacher/:id', autenticateToken, authorizeRoles('admin'), classe.deleteTeacher);
classeRoutes.delete('/delete/:id', autenticateToken, authorizeRoles('admin'), classe.deleteClass);
classeRoutes.get('/search', autenticateToken, authorizeRoles('admin', 'teacher'), classe.searchClasses);


export {classeRoutes}
