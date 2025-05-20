
import admin from "../modules/admin/index.js";
import { Router } from "express";

const adminRoutes = Router();

adminRoutes.post('/create', admin.createAdmin)
adminRoutes.post('/login', admin.login)
adminRoutes.get('/get/:id', admin.getAdminById);
adminRoutes.get('/getall', admin.getAllAdmins);
adminRoutes.put('/update/:id', admin.updateAdmin);
adminRoutes.delete('/delete/:id', admin.deleteAdmin);

export {adminRoutes}