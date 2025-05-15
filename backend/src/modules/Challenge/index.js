import { prisma } from "../../lib/prisma.js";

export default {
  async createChallenge(req, res) {
    let challenge_id = 0;
    const {
      user_id,
      title,
      description,
      pic_url,
      initial_date,
      final_date,
      category_id,
    } = req.body;
    console.log("TESTE", user_id);
    try {
      const challenge = await prisma.challenge.create({
        data: {
          title,
          description,
          initial_date,
          final_date,
          pic_url,
          user: {
            connect: {
              id: user_id,
            },
          },
          challengeCategory: {
            connect: {
              id: category_id,
            },
          },
        },
      });
      res.json(challenge);
      challenge_id = challenge.id;
    } catch (error) {
      console.error("Erro while creating challenge", error);
      res.status(500).json({ error: "Erro while creating challenge" });
    }
     try {
       const participant = await prisma.challengeParticipant.create({
         data: {
           challenge_id,
           user_id
         },
       })
     } catch (error) {
       console.error("Erro while creating participant", error);
     }
  },
  async deleteChallenge(req, res) {
    const { id } = req.params;
    const challenge_id = parseInt(id);
    const challenge_exists = await prisma.challenge.findMany({
      where: { id: challenge_id },
    });
    if (!challenge_exists) {
      res.status(500).json({ erro: "Challenge not found" });
    }
    try {
      const deleted_challenge = await prisma.challenge.delete({
        where: {
          id: challenge_id,
        },
      });
      res.json(deleted_challenge);
    } catch (error) {
      console.error("Erro while deleting challenge", error);
      res.status(500).json({ erro: "Erro while deleting challenge", error });
    }
  },

  async updateChallenge(req, res) {
    console.log(" UPDATE");
    const { id } = req.params;

    const challenge_id = parseInt(id);

    const {
      title,
      description,
      pic_url,
      initial_date,
      final_date,
      category_id,
    } = req.body;

    const challenge_exists = await prisma.challenge.findUnique({
      where: { id: challenge_id },
    });
    if (!challenge_exists) {
      res.status(500).json({ erro: "Challenge not found" });
    }

    try {
      const updated_challenge = await prisma.challenge.update({
        where: {
          id: challenge_id,
        },
        data: {
          title,
          description,
          pic_url,
          initial_date,
          final_date,
          user: {
            connect: {
              id: user_id,
            },
          },
          challengeCategory: {
            connect: {
              id: category_id,
            },
          },
        },
      });
      res.json(updated_challenge);
    } catch (error) {
      console.error("Erro while updating challenge", error);
      res.status(500).json({ erro: "Erro while updating challenge", error });
    }
  },
  async findChallengeById(req, res) {
    try {
      const { id } = req.params;
      const challenge = await prisma.challenge.findUnique({
        where: { id: Number(id) },
      });
      if (!challenge) return res.json({ error: "Challenge does not exist" });
      return res.json(challenge);
    } catch (error) {
      return res.json({ error });
    }
  },
  async findAllChallengesByUser(req, res) {
    try {
      const { id } = req.params;
      console.log("jjjjjjjjjjjjj", id)

      const challenges = await prisma.challenge.findMany({
        where: { user_id: id },
      });

      const participantChallenges = await prisma.challengeParticipant.findMany({
        where: {
          user_id: id,
          challenge:{
            user_id: {
              not: id
            }
          }
        },
        include: {
          challenge: {
            include: {
              user: {
                select: {
                  name:true,
                  username:true,
                  profile_pic_url:true
                }
              }
            }
          }
        }
      })

      const allChallenges = [
        ...challenges,
        ...participantChallenges.map(participant => participant.challenge)
      ]
      console.log(allChallenges, '------------------------------')
      if (allChallenges.length === 0) return res.json({ error: "Challenges does not exist" });
      return res.json(allChallenges);
    } catch (error) {
      return res.json({ error });
    }
  },

  async findAllChallengesByPrivacy(req, res) {
    try {
      const { id } = req.params;
      const challenge = await prisma.challenge.findMany({
        where: {
          privacy_id: Number(id),
        },
      });
      if (!challenge) return res.json({ error: "Challenge does not exist" });
      return res.json(challenge);
    } catch (error) {
      return res.json({ error });
    }
  },

  async findAllChallengesByDate(req, res) {
    const { date } = req.params;
    const user_id = req.query.user_id;

    // Parse the date string to create a Date object
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Set the start and end of the day in UTC
    const startOfDay = new Date(dateObj);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(dateObj);
    endOfDay.setUTCHours(23, 59, 59, 999);

    try {
      // Fetch challenges within the start and end of the day
      const challenges = await prisma.challenge.findMany({
        where: {
          user_id,
          challenge_date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          location: true,
          user: {
            select: {
              name: true,
              profile_pic_url: true,
            },
          },
          _count: {
            select: {
              Participant: true,
            },
          },
        },
      });

      const participantChallenges = await prisma.challengeParticipant.findMany({
        where: {
          user_id,
          challenge: {
            challenge_date: {
              gte: startOfDay,
              lte: endOfDay,
            },
            user_id: {
              not: user_id,
            },
          },
        },
        include: {
          challenge: {
            include: {
              location: true,
              user: {
                select: {
                  username: true,
                  name: true,
                  profile_pic_url: true,
                },
              },
              _count: {
                select: {
                  Participant: true,
                },
              },
            },
          },
        },
      });

      // Combine both sets of challenges
      const allChallenges = [
        ...challenges,
        ...participantChallenges.map((participant) => participant.challenge),
      ];

      if (!allChallenges || allChallenges.length === 0) {
        return res.json({ error: "No challenges found for this date" });
      }

      return res.json(allChallenges);
    } catch (error) {
      console.log("Error while processing challenges");
      return res.status(500).json({ error: "Internal server error" });
    }
  },
};
