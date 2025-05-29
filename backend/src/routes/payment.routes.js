import autenticateToken from "../middleware/authenticateToken.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import payment from "../modules/payment/index.js";
import { Router } from "express";

const paymentRoutes = Router();

paymentRoutes.post('/create', autenticateToken, authorizeRoles('admin', 'teacher', 'student'), payment.createPayment)
paymentRoutes.get('/get/date/:date', autenticateToken, authorizeRoles('admin'), payment.getPaymenstByMonth);
paymentRoutes.get('/get/student/:student_id', autenticateToken, authorizeRoles('admin', 'student'), payment.getPaymentsByStudentID);
paymentRoutes.get('/getall', autenticateToken, authorizeRoles('admin'), payment.getAllPayments);

export {paymentRoutes}
