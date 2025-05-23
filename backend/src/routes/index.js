import express from 'express';
import { adminRoutes } from './admin.routes.js';
import { studentRoutes } from './student.routes.js';
import { teacherRoutes } from './teacher.routes.js';
import { loginRoutes } from './login.routes.js';
import { attendenceRoutes } from './attendence.routes.js';

const routes = express()

routes.use('/admin', adminRoutes)
routes.use('/student', studentRoutes)
routes.use('/teacher', teacherRoutes)
routes.use('/attendence', attendenceRoutes)
routes.use('/login', loginRoutes)


export {routes}
