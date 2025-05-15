import Registration from "../modules/Registration/index.js";

import { Router } from "express";

const registrationRoutes = Router()

registrationRoutes.post('/', Registration.createRegistration)
registrationRoutes.get('/:id', Registration.getRegistrationsByEventId)

export {registrationRoutes}