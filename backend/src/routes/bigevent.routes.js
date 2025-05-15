import BigEvent from "../modules/BigEvent/index.js";

import { Router } from "express";

const bigEventRoutes = Router()

bigEventRoutes.post('/', BigEvent.createBigEvent)
bigEventRoutes.get('/all', BigEvent.getBigEvents)

export {bigEventRoutes}