import { prisma } from "../../lib/prisma.js";

export default {

  async createParticipant(req, res) {
    const { user_id, challenge_id } = req.body
    const challenge_exists = await prisma.challenge.findUnique({ where: { id: Number(challenge_id) } });
    const user_exists = await prisma.user.findUnique({ where: { id: user_id } });

    if (!challenge_exists && !user_exists) {
      res.status(500).json({ error: "Event or User not founds" });
      console.log("Event or User not founds")
      return
    }

    const participant_exists = await prisma.challengeParticipant.findUnique({
      where: {
        challenge_id_user_id: {
          challenge_id: Number(challenge_id),
          user_id
        }
      }
    });

    if (participant_exists) {
      res.status(500).json({ error: "Participant already exists" });
      console.log("Participant already exists")
      return;
    }

    try {
      const participant = await prisma.challengeParticipant.create({
        data: {
          challenge_id,
          user_id
        },
      })
      res.json(participant);
    } catch (error) {
      console.error("Erro while creating participant", error);
      res.status(500).json({ error: "Erro while creating a new participant" });

    }
  },


  //fazer umas função so para verificar se existe
  async getParticipantById(req, res) {
    const { user_id, challenge_id } = req.body;

    console.log("TESTE", user_id, challenge_id);
    try {
      const user_exists = await prisma.user.findUnique({
        where: { id: user_id },
      });

      const challenge_exists = await prisma.challenge.findUnique({
        where: { id: Number(challenge_id) },
      });

      if (!challenge_exists || !user_exists) {
        res.status(404).json({ error: "Event or User not found" });
        console.log("Event or User not found");
        return;
      }


      const participant_exists = await prisma.challengeParticipant.findUnique({
        where: {
          challenge_id_user_id: {
            challenge_id: Number(challenge_id),
            user_id: user_id,
          },
        },
      });

      if (participant_exists) {
        console.log("Participant already exists");
        res.json({ participant_already_exists: true });
        return;
      }

      res.json({ participant_already_exists: false });
    } catch (error) {
      console.error("Error while checking participant", error);
      res.status(500).json({ error: "Error while checking participant" });
    }
  },
  async getParticipantsByChallengeId(req, res) {
    const { challenge_id } = req.params;
    const challengeId = Number(challenge_id);
    console.log("TESTE", challenge_id);
    try {

      const challenge_exists = await prisma.challenge.findUnique({
        where: { id: Number(challenge_id) }
      });

      if (!challenge_exists) {
        res.status(404).json({ error: "Challenge not found" });
        console.log("Challenge not found");
        return;
      }


      // Busca os participantes do challenge
      const participants = await prisma.challengeParticipant.findMany({
        where: {
          challenge_id: challengeId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              profile_pic_url: true,
            },
          },
        },
      });

      // Itera sobre os participantes e busca a contagem de check-ins para cada um
      const participantsWithCheckIns = await Promise.all(
        participants.map(async (participant) => {
          const checkInCount = await prisma.checkIn.count({
            where: {
              challenge_id: challengeId,
              user_id: participant.user_id,
            },
          });

          return {
            ...participant,
            checkInCount, // Adiciona a contagem de check-ins
          };
        })
      );

      // Retorna o resultado como JSON
      return res.json(participantsWithCheckIns);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar participantes e check-ins." });
    }
  },
  

  async deleteParticipantById(req, res) {
      const { user_id, challenge_id } = req.body;

      console.log("TESTE", user_id, challenge_id);
      try {
        const user_exists = await prisma.user.findUnique({
          where: { id: user_id },
        });

        const challenge_exists = await prisma.challenge.findUnique({
          where: { id: Number(challenge_id) },
        });

        if (!challenge_exists || !user_exists) {
          res.status(404).json({ error: "Event or User not found" });
          console.log("Event or User not found");
          return;
        }


        const participant_deleted = await prisma.challengeParticipant.delete({
          where: {
            challenge_id_user_id: {
              challenge_id: Number(challenge_id),
              user_id: user_id,
            },
          },
        });

        if (participant_deleted) {
          console.log("Participant deleted");
          res.json({ participant_deleted: true });
          return;
        }

        res.json({ participant_deleted: false });
      } catch (error) {
        console.error("Error while deleting participant", error);
        res.status(500).json({ error: "Error while deleting participant" });
      }
    }

  };

