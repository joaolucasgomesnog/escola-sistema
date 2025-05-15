
import Event from "../modules/Event/index.js"
import { Router } from "express";

const eventRoutes = Router();

eventRoutes.post("/", Event.createEvent)
eventRoutes.get("/list", Event.findAllEvents)
eventRoutes.get("/privacy/:id", Event.findAllEventsByPrivacy)
eventRoutes.get("/user/:id", Event.findAllEventsByUser)

eventRoutes.get("/nearby", Event.findNearbyEvents)

eventRoutes.get("/:id", Event.findEventById)
eventRoutes.get("/date/:date", Event.findAllEventsByDate)
eventRoutes.put("/:id", Event.updateEvent)
eventRoutes.delete("/:id", Event.deleteEvent)

eventRoutes.get("/category/list", Event.findAllCategories)


export {eventRoutes}