import ChallengeParticipant from "../modules/ChallengeParticipant/index.js";
import { Router } from "express";

const challengeParticipantRoutes = Router();

challengeParticipantRoutes.post("/add", ChallengeParticipant.createParticipant)
challengeParticipantRoutes.post("/exists", ChallengeParticipant.getParticipantById)
challengeParticipantRoutes.get("/challenge/:challenge_id", ChallengeParticipant.getParticipantsByChallengeId)
challengeParticipantRoutes.delete("/delete", ChallengeParticipant.deleteParticipantById)

export {challengeParticipantRoutes}