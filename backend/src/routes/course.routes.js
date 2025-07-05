import autenticateToken from "../middleware/authenticateToken.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import course from "../modules/course/index.js";
import { Router } from "express";

const courseRoutes = Router();

courseRoutes.post('/create', autenticateToken, authorizeRoles('admin'), course.createCourse)
courseRoutes.get('/get/:code', autenticateToken, authorizeRoles('admin', 'teacher'), course.getCourseByCode);
courseRoutes.get('/get-by-id/:id', autenticateToken, authorizeRoles('admin', 'teacher'), course.getCourseById);
courseRoutes.get('/getall', autenticateToken, authorizeRoles('admin', 'teacher', 'student'), course.getAllCourses);
// courseRoutes.get('/get-students/:id', autenticateToken, authorizeRoles('admin', 'teacher', 'student'), course.getStudents);
courseRoutes.put('/update/:id', autenticateToken, authorizeRoles('admin'), course.updateCourse);
courseRoutes.delete('/delete/:id', autenticateToken, authorizeRoles('admin'), course.deleteCourse);

export {courseRoutes}
