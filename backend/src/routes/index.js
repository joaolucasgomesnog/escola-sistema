import express from 'express';
import { adminRoutes } from './admin.routes.js';
import { studentRoutes } from './student.routes.js';

const routes = express()

routes.use('/admin', adminRoutes)
routes.use('/student', studentRoutes)


export {routes}
