import { prisma } from "../../lib/prisma.js";
import Notification from "../PushNotification/index.js";

// Função para criar uma notificação

let notificationQueue = {}; // Fila de notificações por usuário
let notificationTimeouts = {}; // Timer para cada usuário

const NOTIFICATION_DELAY = 120000; // 1 minuto para agrupar as notificações
const MAX_NOTIFICATIONS_BEFORE_GROUP = 3; // Número máximo de notificações antes de agrupar


export default {
  async createNotification(type, userId, triggeredById, postId = null) {
    try {
      const newNotification = await prisma.notification.create({
        data: {
          type,
          userId,
          triggeredById,
          postId,
        },
      });
  
      // Limpa notificações antigas ou excedentes
      await this.cleanOldNotifications(userId);
  
      // Resto do código para manipulação de notificações
      const { username: sender_name } = await prisma.user.findUnique({
        where: { id: triggeredById },
        select: { username: true }
      });
      
      let notificationMessage = `${sender_name} você tem novas atualizações`;
      if (newNotification.type === 'like') {
        notificationMessage = `${sender_name} curtiu sua publicação`;
      } else if (newNotification.type === 'comment') {
        notificationMessage = `${sender_name} comentou sua publicação`;
      } else if (following_id) {
        notificationMessage = `${sender_name} começou a te seguir`;
      }
  
      if (!notificationQueue[userId]) {
        notificationQueue[userId] = [];
      }
    
      notificationQueue[userId].push(notificationMessage);
    
      if (notificationQueue[userId].length <= MAX_NOTIFICATIONS_BEFORE_GROUP) {
        Notification.sendImmediateNotification(userId, notificationMessage);
      } else {
        if (notificationTimeouts[userId]) {
          clearTimeout(notificationTimeouts[userId]);
        }
  
        notificationTimeouts[userId] = setTimeout(() => {
          Notification.sendGroupedNotification(userId, notificationQueue, notificationTimeouts);
        }, NOTIFICATION_DELAY);
      }
  
      return newNotification;
    } catch (error) {
      console.error("Erro ao criar notificação:", error);
      throw error;
    }
  },
  
  // Função para obter todas as notificações por userId
  async getAllNotificationsByUserId(req, res) {
    try {
      const { id } = req.params;

      const notifications = await prisma.notification.findMany({
        where: { userId: id },
        include: {
          Post: {
            select: {
              id: true, // Selecionar apenas o ID do post
              description: true, // Selecionar a descrição do post
              media_url: true, // Selecionar a URL da mídia (se aplicável)
            },
          },
          triggeredBy: {
            select: {
              id: true,
              username: true,
              profile_pic_url: true,
            },
          },
        },
        orderBy: { created_at: "desc" }, // Ordenar pela mais recente
      });

      return res.status(200).json(notifications);
    } catch (error) {
      console.error("Erro ao obter notificações:", error);
      throw error;
    }
  },

  // Função para deletar todas as notificações por userId
  async deleteAllNotificationsByUserId(req, res) {
    try {
      const { id } = req.params;

      const deleteCount = await prisma.notification.deleteMany({
        where: { userId: id },
      });
      return deleteCount;
    } catch (error) {
      console.error("Erro ao deletar notificações:", error);
      throw error;
    }
  },

  async cleanOldNotifications(userId) {
    // Excluir notificações com mais de 3 meses
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
    await prisma.notification.deleteMany({
      where: {
        userId,
        created_at: { lt: threeMonthsAgo },
      },
    });
  
    // Obter as notificações mais recentes para verificar o limite
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { created_at: "desc" }, // Ordena pela mais recente
      skip: 100, // Pula as 100 mais recentes
    });
  
    // Obter IDs das notificações mais antigas para deletar
    const idsToDelete = notifications.map(notification => notification.id);
  
    // Excluir as notificações mais antigas além das 100 mais recentes
    if (idsToDelete.length > 0) {
      await prisma.notification.deleteMany({
        where: { id: { in: idsToDelete } },
      });
    }
  }
  
};
