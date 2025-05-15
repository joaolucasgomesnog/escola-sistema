import { prisma } from "./../../lib/prisma.js";

export default {
  async createBigEvent(req, res) {
    console.log("teste");
  },

  async getBigEvents(req, res) {
    console.log("teste");
    try {
      const events = await prisma.bigEvent.findMany({
        include: {
          location: true,
          event_category: true,
        }
      })

      return res.status(200).json(events)
    } catch (error) {
      return res.json({ error });
      
    }

  },
};
