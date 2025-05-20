
import autenticateToken from "../middleware/authenticateToken.js";
import admin from "../modules/admin/index.js";
import { Router } from "express";

const adminRoutes = Router();

adminRoutes.post('/login', admin.login)
adminRoutes.post('/create', autenticateToken , admin.createAdmin)
adminRoutes.get('/get/:id', autenticateToken, admin.getAdminById);
adminRoutes.get('/getall', autenticateToken, admin.getAllAdmins);
adminRoutes.put('/update/:id', autenticateToken, admin.updateAdmin);
adminRoutes.delete('/delete/:id', autenticateToken, admin.deleteAdmin);

export {adminRoutes}