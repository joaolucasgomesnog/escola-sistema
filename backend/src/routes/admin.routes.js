//ROTAS DE ADMIN
import autenticateToken from "../middleware/authenticateToken.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import admin from "../modules/Admin/index.js";
import { Router } from "express";

const adminRoutes = Router();

adminRoutes.post('/logout/', autenticateToken, authorizeRoles('admin'), admin.logout);
adminRoutes.post('/create', autenticateToken, authorizeRoles('admin'), admin.createAdmin)
adminRoutes.get('/get/:id', autenticateToken, authorizeRoles('admin'), admin.getAdminById);
adminRoutes.get('/getall', autenticateToken, authorizeRoles('admin'), admin.getAllAdmins);
adminRoutes.get('/allnames', autenticateToken, authorizeRoles('admin'), admin.getAllNames);
adminRoutes.put('/update/:id', autenticateToken, authorizeRoles('admin'), admin.updateAdmin);
adminRoutes.delete('/delete/:id', autenticateToken, authorizeRoles('admin'), admin.deleteAdmin);
adminRoutes.get('/search', autenticateToken, authorizeRoles('admin', 'teacher'), admin.searchAdmin);


export {adminRoutes}
