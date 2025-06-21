import autenticateToken from "../middleware/authenticateToken.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import fee from "../modules/fee/index.js";
import { Router } from "express";

const feeRoutes = Router();

feeRoutes.post('/create', autenticateToken, authorizeRoles('admin'), fee.createFee)
feeRoutes.get('/get/:id', autenticateToken, authorizeRoles('admin'), fee.getFeeByID);
feeRoutes.get('/getall', autenticateToken, authorizeRoles('admin'), fee.getAllFees);
feeRoutes.put('/update/:id', autenticateToken, authorizeRoles('admin'), fee.updateFee);
feeRoutes.delete('/delete/:id', autenticateToken, authorizeRoles('admin'), fee.deleteFee);
feeRoutes.get("/student/:studentId", autenticateToken, authorizeRoles('admin'), fee.getFeesByStudent);

export {feeRoutes}
