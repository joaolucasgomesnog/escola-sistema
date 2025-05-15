import notification from "../modules/Notification/index.js";
import { Router } from "express";

const notificationRoutes = Router()

notificationRoutes.get('/:id', notification.getAllNotificationsByUserId)
notificationRoutes.delete('/:id', notification.deleteAllNotificationsByUserId)

export { notificationRoutes }