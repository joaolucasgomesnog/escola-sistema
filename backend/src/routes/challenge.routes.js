
import Challenge from "../modules/Challenge/index.js"
import { Router } from "express";

const challengeRoutes = Router();

challengeRoutes.post("/", Challenge.createChallenge)
challengeRoutes.get("/privacy/:id", Challenge.findAllChallengesByPrivacy)
challengeRoutes.get("/user/:id", Challenge.findAllChallengesByUser)
challengeRoutes.get("/:id", Challenge.findChallengeById)
challengeRoutes.get("/date/:date", Challenge.findAllChallengesByDate)
challengeRoutes.put("/:id", Challenge.updateChallenge)
challengeRoutes.delete("/:id", Challenge.deleteChallenge)


export {challengeRoutes}