import { prisma } from "../../lib/prisma.js";
import Challenge from "../Challenge/index.js";

export default {
  async createCheckIn(req, res) {
    const {
      user_id,
      description,
      challenge_id,
      pic_url,
      created_at } = req.body;
    console.log("TESTE", user_id)
    try {
      const checkIn = await prisma.checkIn.create({
        data: {
          description,
          created_at,
          pic_url,
          user: {
            connect: {
              id: user_id,
            },
          },
          challenge: {
            connect: {
              id: challenge_id,
            }
          }
        },
      });
      res.json(checkIn);
    } catch (error) {
      console.error("Erro while creating checkIn", error);
      res.status(500).json({ error: "Erro while creating checkIn" });
    }
    // try {
    //   const participant = await prisma.checkInParticipant.create({
    //     data: {
    //       checkIn_id,
    //       user_id
    //     },
    //   })
    //   res.status(201).json(participant);
    // } catch (error) {
    //   console.error("Erro while creating participant", error);
    //   res.status(500).json({ error: "Erro while creating a new participant" });

    // }
  },
  async deleteCheckIn(req, res) {
    const { id } = req.params;
    const checkIn_id = parseInt(id);
    const checkIn_exists = await prisma.checkIn.findMany({ where: { id: checkIn_id } });
    if (!checkIn_exists) {
      res.status(500).json({ erro: "CheckIn not found" });
    }
    try {
      const deleted_checkIn = await prisma.checkIn.delete({
        where: {
          id: checkIn_id,
        },
      });
      res.json(deleted_checkIn);
    } catch (error) {
      console.error("Erro while deleting checkIn", error);
      res.status(500).json({ erro: "Erro while deleting checkIn", error });
    }
  },


  async updateCheckIn(req, res) {
    console.log(" UPDATE");
    const { id } = req.params;

    const checkIn_id = parseInt(id);

    const {
      description,
      pic_url
    } = req.body;

    const checkIn_exists = await prisma.checkIn.findUnique({
      where: { id: checkIn_id },
    });
    if (!checkIn_exists) {
      res.status(500).json({ erro: "CheckIn not found" });
    }

    try {
      const updated_checkIn = await prisma.checkIn.update({
        where: {
          id: checkIn_id,
        },
        data: {
          description,
          pic_url
        },
      });
      res.json(updated_checkIn);
    } catch (error) {
      console.error("Erro while updating checkIn", error);
      res.status(500).json({ erro: "Erro while updating checkIn", error });
    }
  },
  async findCheckInById(req, res) {
    try {
      const { id } = req.params;
      const checkIn = await prisma.checkIn.findUnique({
        where: { id: Number(id) },
      });
      if (!checkIn) return res.json({ error: "CheckIn does not exist" });
      return res.json(checkIn);
    } catch (error) {
      return res.json({ error });
    }
  },
  async findAllCheckInsByUser(req, res) {
    try {
      const { id } = req.params;
      const checkIn = await prisma.checkIn.findMany({
        where: { user_id: id }
      });
      if (!checkIn) return res.json({ error: "CheckIn does not exist" });
      return res.json(checkIn);
    } catch (error) {
      return res.json({ error });
    }
  },

  async findAllCheckInsByDate(req, res) {
    const { date } = req.params;
    const challenge_id = req.query.challenge_id;
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
      // Fetch checkIns within the start and end of the day
      const checkIns = await prisma.checkIn.findMany({
        where: {
          challenge_id: Number(challenge_id),
          created_at: {
            gte: startOfDay,
            lte: endOfDay,
          },

        },
        include: {
          user: {
            select: {
              name: true,
              profile_pic_url: true,
            }
          }
        },
        orderBy:{
          created_at: 'asc'
        }

      });


      return res.json(checkIns);
    } catch (error) {
      console.error('Error while processing checkIns:', error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};
