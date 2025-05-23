//ROTAS DE ADMIN
import autenticateToken from "../middleware/authenticateToken.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import classe from "../modules/classe/index.js";
import { Router } from "express";

const classeRoutes = Router();

classeRoutes.post('/create', autenticateToken, authorizeRoles('admin'), classe.createClass)
classeRoutes.get('/get/:code', autenticateToken, authorizeRoles('admin', 'teacher', 'student'), classe.getClassByCode);
classeRoutes.get('/getall', autenticateToken, authorizeRoles('admin', 'teacher', 'student'), classe.getAllClasses);
classeRoutes.put('/update/:id', autenticateToken, authorizeRoles('admin'), classe.updateClass);
classeRoutes.delete('/delete/:id', autenticateToken, authorizeRoles('admin'), classe.deleteClass);

export {classeRoutes}
