import express from 'express';
import { adminRoutes } from './admin.routes.js';

const routes = express()

routes.use('/admin', adminRoutes)


export {routes}
