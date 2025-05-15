
import { createAdmin } from "../modules/Admin/index.js";
import admin from "../modules/Admin/index.js";
import { Router } from "express";

const adminRoutes = Router();

adminRoutes.post('/', admin.createAdmin)
adminRoutes.get('/', admin.getAllAdmins);
adminRoutes.get('/:id', admin.getAdminById);
adminRoutes.put('/:id', admin.updateAdmin);
adminRoutes.delete('/:id', admin.deleteAdmin);

export {adminRoutes}