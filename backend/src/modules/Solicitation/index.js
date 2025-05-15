import { prisma } from "../../lib/prisma.js";
import Notification from "../PushNotification/index.js";

export default {
  async createSolicitation(req, res) {
    let solicitation_id = 0;
    const {
      sender_id,
      receiver_id,
      challenge_id,
      event_id
    } = req.body;
    console.log("TESTE", sender_id);
    try {
      const solicitation = await prisma.solicitation.create({
        data: {
          sender: {
            connect: {
              id: sender_id,
            },
          },
          receiver:{
            connect: {
              id: receiver_id,
            }
          },
          challenge: challenge_id ? { 
            connect: { id: challenge_id } 
          } : undefined, // Conectando ao challenge se o ID for fornecido
          event: event_id ? { 
            connect: { id: event_id } 
          } : undefined, // Conectando ao event se o ID for fornecido
        },
      });

      const {username: sender_name} = await prisma.user.findUnique({
        where: { id: sender_id },
        select: {username: true}
      })

      let notificationMessage = `${sender_name} te enviou uma solicitação.`;

      if(challenge_id){
        notificationMessage = `${sender_name} te convidou para um desafio.`
      }else if (event_id){
        notificationMessage = `${sender_name} te convidou para um evento.`
      }else{
        notificationMessage = `${sender_name} solicitou para te seguir.`
      }

      const {notificationTokens} = await Notification.getNotificationTokenByUserId(receiver_id)

      if (notificationTokens.length > 0) {
        await Promise.all(
          notificationTokens.map(async (token) => {
            await Notification.sendPushNotification(token, notificationMessage);
          })
        );
        console.log('Notificações enviadas para todos os tokens');
      }
      

      res.json(solicitation);
      solicitation_id = solicitation.id;
    } catch (error) {
      console.error("Erro while creating solicitation", error);
      res.status(500).json({ error: "Erro while creating solicitation" });
    }
  },
  async deleteSolicitation(req, res) {
    const { id } = req.params;
    const solicitation_id = parseInt(id);
    const solicitation_exists = await prisma.solicitation.findMany({
      where: { id: solicitation_id },
    });
    if (!solicitation_exists) {
      res.status(500).json({ erro: "Solicitation not found" });
    }
    try {
      const deleted_solicitation = await prisma.solicitation.delete({
        where: {
          id: solicitation_id,
        },
      });
      res.json(deleted_solicitation);
    } catch (error) {
      console.error("Erro while deleting solicitation", error);
      res.status(500).json({ erro: "Erro while deleting solicitation", error });
    }
  },

  async findSolicitationById(req, res) {
    try {
      const { id } = req.params;
      const solicitation = await prisma.solicitation.findUnique({
        where: { id: Number(id) },
      });
      if (!solicitation) return res.json({ error: "Solicitation does not exist" });
      return res.json(solicitation);
    } catch (error) {
      return res.json({ error });
    }
  },
  async findAllSolicitationsByReceiver(req, res) {
    try {
      const { id } = req.params;
      console.log("jjjjjjjjjjjjj", id)

      const solicitations = await prisma.solicitation.findMany({
        where: { receiver_id: id, status:'PENDING'},
        include: {
          sender: {
            select: {
              username: true,
              name: true,
              profile_pic_url: true
            }
          },
          challenge: {
            select: {
              title: true
            }
          },
          event: {
            select: {
              title: true
            }
          },
        }
      });

      return res.json(solicitations);
    } catch (error) {
      return res.json({ error });
    }
  },
  async findAllSolicitationsBySender(req, res) {
    try {
      const { id } = req.params;
      console.log("jjjjjjjjjjjjj", id)

      const solicitations = await prisma.solicitation.findMany({
        where: { sender_id: id },
      });

      return res.json(solicitations);
    } catch (error) {
      return res.json({ error });
    }
  },

  async acceptSolicitation(req, res) {
    console.log("UPDATE");
    let participant = null;
    const { id } = req.params;
    const solicitation_id = parseInt(id);
  
    // Supondo que você pega o user_id do body ou de alguma autenticação
    const { user_id } = req.body; // ou const user_id = req.user.id;
  
    try {
      // Busca pela solicitação, incluindo challenge e event
      const solicitation = await prisma.solicitation.findUnique({
        where: { id: solicitation_id },
        include: { challenge: true, event: true }
      });
  
      if (!solicitation) {
        return res.status(404).json({ erro: "Solicitação não encontrada" });
      }
  
      // Se for um desafio
      if (solicitation.challenge) {
        try {
          participant = await prisma.challengeParticipant.create({
            data: {
              challenge_id: solicitation.challenge_id,
              user_id: solicitation.receiver_id
            },
          });
        } catch (error) {
          console.error("Erro ao ingressar no challenge", error);
          return res.status(500).json({ erro: "Erro ao ingressar no challenge" });
        }
      }
      // Se for um evento
      else if (solicitation.event) {
        try {
          participant = await prisma.eventParticipant.create({
            data: {
              event_id: solicitation.event_id,
              user_id: solicitation.receiver_id
            },
          });
        } catch (error) {
          console.error("Erro ao ingressar no evento", error);
          return res.status(500).json({ erro: "Erro ao ingressar no evento" });
        }
      }else {
        try {
          participant = await prisma.following.create({
            data: {
              follower_id: solicitation.sender_id,
              following_id: solicitation.receiver_id
            },
          });
        } catch (error) {
          console.error("Erro ao aceitar seguidor", error);
          return res.status(500).json({ erro: "Erro ao aceitar seguidor" });
        }
      }
  
      // Se o participante foi criado, atualiza o status da solicitação
      if (participant) {
        await prisma.solicitation.update({
          where: { id: solicitation_id },
          data: { status: 'ACCEPTED' }
        });
        return res.status(200).json({ mensagem: "Solicitação aceita com sucesso" });
      }
  
      // Se não houver participante, retorna um erro
      return res.status(400).json({ erro: "Nenhuma participação foi registrada" });
  
    } catch (error) {
      console.error("Erro ao processar a solicitação", error);
      return res.status(500).json({ erro: "Erro ao processar a solicitação" });
    }
  }
  
};
