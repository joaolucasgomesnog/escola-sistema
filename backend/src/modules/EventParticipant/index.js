import { prisma } from "../../lib/prisma.js";
import Notification from '../PushNotification/index.js'


export default {
  async createParticipant(req, res) {
    const { user_id, event_id } = req.body;

    try {
      const event_exists = await prisma.event.findUnique({ where: { id: Number(event_id) } });
      const user_exists = await prisma.user.findUnique({ where: { id: user_id } });
      
      if (!event_exists || !user_exists) {
        res.status(404).json({ error: "Event or User not found" });
        return;
      }

      const participant_exists = await prisma.eventParticipant.findUnique({
        where: {
          event_id_user_id: {
            event_id: Number(event_id),
            user_id,
          },
        },
      });

      if (participant_exists) {
        res.status(409).json({ error: "Participant already exists" });
        return;
      }

      const participant = await prisma.eventParticipant.create({
        data: {
          event_id: Number(event_id),
          user_id,
        },
      });

      //enviar notificação para o dono do evento
      const eventOwner = await prisma.event.findUnique({
        where: {
          id: event_id
        },
        select: {
          user: {
            select: {
              notificationTokens: true, // Pegando o campo 'token' do usuário
            }
          },

        }

      })

      console.log("PPPPPPPPPPPPP", eventOwner.user.notificationTokens, participant)

      if (eventOwner.user.notificationTokens.length > 0) {
        await Promise.all(
          eventOwner.user.notificationTokens.map(async (token) => {
            await Notification.sendPushNotification(token, `${user_exists.username} se juntou ao seu evento!`);
          })
        );
        console.log('Notificações enviadas para todos os tokens');
      }
      

      res.status(201).json(participant);
    } catch (error) {
      console.error("Error while creating participant", error);
      res.status(500).json({ error: "Error while creating a new participant" });
    }
  },


  //fazer umas função so para verificar se existe
  async getParticipantById(req, res) {
    const { user_id, event_id } = req.body;
  
    console.log("TESTE", user_id, event_id);
    try {
      const user_exists = await prisma.user.findUnique({
        where: { id: user_id },
      });
  
      const event_exists = await prisma.event.findUnique({
        where: { id: Number(event_id) },
      });
      
      if (!event_exists || !user_exists) {
        res.status(404).json({ error: "Event or User not found" });
        console.log("Event or User not found");
        return;
      }
  
  
      const participant_exists = await prisma.eventParticipant.findUnique({
        where: {
          event_id_user_id: {
            event_id: Number(event_id),
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
  async getParticipantsByEventId(req, res) {
    const { event_id } = req.params;
    const eventId = Number(event_id);
    console.log("TESTE", event_id);
    try {

      const event_exists = await prisma.event.findUnique({
        where: { id: Number(event_id) },
      });
      
      if (!event_exists) {
        res.status(404).json({ error: "Event not found" });
        console.log("Event not found");
        return;
      }
  
  
      const participants = await prisma.eventParticipant.findMany({
        where: {
          event_id: eventId
        },
        include:{
          user:true
        }
      });
  
      if (participants) {
        res.json(participants);
        return;
      }
  
      res.json('erro');
    } catch (error) {
      console.error("Error while checking participants", error);
      res.status(500).json({ error: "Error while checking participants" });
    }
  },

  async deleteParticipantById(req, res) {
    const { user_id, event_id } = req.body;
  
    console.log("TESTE", user_id, event_id);
    try {
      const user_exists = await prisma.user.findUnique({
        where: { id: user_id },
      });
  
      const event_exists = await prisma.event.findUnique({
        where: { id: Number(event_id) },
      });
      
      if (!event_exists || !user_exists) {
        res.status(404).json({ error: "Event or User not found" });
        console.log("Event or User not found");
        return;
      }
  
  
      const participant_deleted = await prisma.eventParticipant.delete({
        where: {
          event_id_user_id: {
            event_id: Number(event_id),
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

