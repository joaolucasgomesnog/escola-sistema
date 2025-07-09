import autenticateToken from "../middleware/authenticateToken.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import discount from "../modules/discount/index.js";
import { Router } from "express";

const discountRoutes = Router();

discountRoutes.post('/create', autenticateToken, authorizeRoles('admin'), discount.createDiscount)
discountRoutes.get('/get/:id', autenticateToken, authorizeRoles('admin'), discount.getDiscountByID);
discountRoutes.get('/getall', autenticateToken, authorizeRoles('admin'), discount.getAllDiscounts);
discountRoutes.put('/update/:id', autenticateToken, authorizeRoles('admin'), discount.updateDiscount);
discountRoutes.delete('/delete/:id', autenticateToken, authorizeRoles('admin'), discount.deleteDiscount);
discountRoutes.get("/student/:studentId", autenticateToken, authorizeRoles('admin'), discount.getDiscountsByStudent);

export {discountRoutes}
