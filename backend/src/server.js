import express from 'express';
import { routes } from './routes/index.js';
import cors from "cors";
import { Server } from 'socket.io';
import { createServer } from 'http';

import Message from './modules/Message/index.js';
import Notification from './modules/PushNotification/index.js';

const PORT = process.env.PORT || 3030;
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type"],
        credentials: true
    }
});

app.use(express.json());
app.use(cors({
    origin: "*",
    methods: "GET,PUT,POST,DELETE",
    optionsSuccessStatus: 204
}));

app.use(routes);

app.get("/", (req, res) => {
    return res.json({ status: 'Servidor Socket.io rodando' });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor ouvindo na porta ${PORT}`);
});

// Função para gerar ID de conversa consistente
const generateConversationId = (userId1, userId2) => {
    return [userId1, userId2].sort().join('-');
};

io.on("connection", (socket) => {
    console.log(`Usuário conectado: ${socket.id}`);

    // Entrar na sala do usuário
    socket.on('join_room', (userId) => {
        socket.join(userId);
        console.log(`Usuário ${userId} entrou na sua sala pessoal`);
    });

    // Entrar na sala de conversa específica
    socket.on('join_conversation', ({ userId, receiverId }) => {
        const conversationId = generateConversationId(userId, receiverId);
        socket.join(conversationId);
        console.log(`Usuário ${userId} entrou na conversa ${conversationId}`);
    });

    // Lidar com novas mensagens
    socket.on('message', async ({ sender_id, sender_name, receiver_id, content }) => {
        console.log(`Nova mensagem de ${sender_id} para ${receiver_id}: ${content}`);

        try {
            // Criar a mensagem no banco de dados
            const message = await Message.createMessage(sender_id, receiver_id, content);
            
            // Gerar ID da conversa
            const conversationId = generateConversationId(sender_id, receiver_id);
            const messageWithConversationId = { ...message, conversationId };
            
            // Emitir a mensagem apenas para os participantes da conversa
            io.to(conversationId).emit('message', messageWithConversationId);
            
            // Emitir também para as salas individuais (para notificações)
            io.to(sender_id).emit('message', messageWithConversationId);
            io.to(receiver_id).emit('message', messageWithConversationId);

            // Atualizar a lista de mensagens para ambos os usuários
            const messages = await Message.fetchAllMessagesByUser(sender_id, receiver_id);
            const response = { 
                messages, 
                conversationId 
            };
            
            io.to(sender_id).emit('get_messages', response);
            io.to(receiver_id).emit('get_messages', response);

            // Enviar notificações push
            const { notificationTokens } = await Notification.getNotificationTokenByUserId(receiver_id);
            
            if (notificationTokens.length > 0) {
                await Promise.all(
                    notificationTokens.map(async (token) => {
                        await Notification.sendPushNotification(
                            token, 
                            `${sender_name}: ${content}`,
                            {
                                // Dados extras para o app
                                data: {
                                    type: 'new_message',
                                    sender_id,
                                    receiver_id,
                                    conversationId,
                                    triggerUpdate: 'true' // Flag para disparar atualização
                                }
                            }
                        );
                    })
                );
                console.log('Notificações enviadas com sucesso');
            }
            
        } catch (error) {
            console.error('Erro ao processar mensagem:', error);
            socket.emit('error', { 
                message: 'Erro ao processar mensagem',
                error: error.message 
            });
        }
    });

    // Obter mensagens de uma conversa específica
    socket.on('get_messages', async ({ userId, receiverId }) => {
        try {
            const messages = await Message.fetchAllMessagesByUser(userId, receiverId);
            const conversationId = generateConversationId(userId, receiverId);
            
            socket.emit('get_messages', { 
                messages, 
                conversationId 
            });
        } catch (error) {
            console.error('Erro ao buscar mensagens:', error);
            socket.emit('error', { 
                message: 'Erro ao buscar mensagens',
                error: error.message 
            });
        }
    });

    socket.on('disconnect', () => {
        console.log(`Usuário desconectado: ${socket.id}`);
    });
});