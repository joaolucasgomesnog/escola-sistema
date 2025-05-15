
import Solicitation from "../modules/Solicitation/index.js"
import { Router } from "express";

const solicitationRoutes = Router();

solicitationRoutes.post("/", Solicitation.createSolicitation)
solicitationRoutes.get("/sender/:id", Solicitation.findAllSolicitationsBySender)
solicitationRoutes.get("/receiver/:id", Solicitation.findAllSolicitationsByReceiver)
solicitationRoutes.get("/:id", Solicitation.findSolicitationById)
solicitationRoutes.delete("/:id", Solicitation.deleteSolicitation)
solicitationRoutes.post("/:id/accept", Solicitation.acceptSolicitation)
solicitationRoutes.post("/:id/decline", Solicitation.deleteSolicitation)

export {solicitationRoutes}