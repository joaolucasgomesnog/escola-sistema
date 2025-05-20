
import autenticateToken from "../middleware/authenticateToken.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import admin from "../modules/admin/index.js";
import { Router } from "express";

const adminRoutes = Router();

adminRoutes.post('/login', admin.login)
adminRoutes.post('/create', autenticateToken, authorizeRoles('admin'), admin.createAdmin)
adminRoutes.get('/get/:id', autenticateToken, authorizeRoles('admin'), admin.getAdminById);
adminRoutes.get('/getall', autenticateToken, authorizeRoles('admin'), admin.getAllAdmins);
adminRoutes.put('/update/:id', autenticateToken, authorizeRoles('admin'), admin.updateAdmin);
adminRoutes.delete('/delete/:id', autenticateToken, authorizeRoles('admin'), admin.deleteAdmin);

export {adminRoutes}