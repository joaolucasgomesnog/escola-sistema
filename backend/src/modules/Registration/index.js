import { prisma } from "../../lib/prisma.js";

export default {
  async createRegistration(req, res) {
    const data = req.body;

    try {
      const registration = await prisma.registration.create({
        data
      });

      console.log("🎯 Registro criado:", registration);
      return res.status(201).json(registration);

    } catch (error) {
      console.error("❌ Erro ao criar inscrição:", error);
      return res.status(500).json({ error: error.message });
    }
  },
  
  async getRegistrationsByEventId(req, res) {
    
    try {
      const {id} = req.params
      const {registration: registrations} = await prisma.bigEvent.findUnique({
        where: {
          id: Number(id),
          
        },
        select: {
          registration: true
        }
      })

      console.log(registrations)

      return res.status(200).json(registrations)
    } catch (error) {
      return res.json({ error });
      
    }

  },
};
