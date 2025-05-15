// import { prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import Notification from "../PushNotification/index.js";

export default {
  async createUser(req, res) {
    const {
      id,
      notificationTokens,
      name,
      username,
      user_category_id,
      profile_pic_url,
      phone,
      email,
      
      address,
      latitude,
      longitude

      // location_id,
    } = req.body;

    console.log(
      "usuario no create",
      notificationTokens,
      name,
      username,
      user_category_id,
      profile_pic_url,
      phone,
      email,

      address,
      latitude,
      longitude
    );

    console.log("usuario", username);

    const userData = {
      id,
      notificationTokens,
      name,
      username,
      email,
      phone,
      // user_category_id: parseInt(user_category_id),
      profile_pic_url,
      user_category: {
        connect: { id: parseInt(user_category_id) }, // Conectando a categoria existente
      },
    };

    if (latitude && longitude) { //NAO EXCLUA ISSO, SENAO DA BUG NA HORA DE CRIAR EVENTO SEM LOCALIZAÇÃO
      userData.current_local_id = {
        create: {
          address: address || null,
          latitude: latitude,
          longitude: longitude
        },
      };
    }

    try {
      const user = await prisma.user.create({
        data: userData,
      });

      res.json(user);
    } catch (error) {
      console.error("Error while creating user:", error);
      res.status(500).json({ error: "Error while creating user" });
    }
  },

  async checkUserAlreadyExists(req, res) {
    const { username, email, phone } = req.body;

    try {
      const results = {
        username: false,
        email: false,
        phone: false,
      };
      const userWithUsername = await prisma.user.findUnique({
        where: { username },
      });
      if (userWithUsername) {
        results.username = true;
      }

      const userWithEmail = await prisma.user.findUnique({ where: { email } });
      if (userWithEmail) {
        results.email = true;
      }

      const userWithPhone = await prisma.user.findUnique({ where: { phone } });
      if (userWithPhone) {
        results.phone = true;
      }

      res.status(200).json(results);
    } catch (error) {
      console.error("Error checking user existence:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  async getContactListByUserId(req, res) {
    const { user_id } = req.params;
    console.log("ID", user_id);
    try {
      // Fetch the user along with their contacts and the most recent messages
      const user = await prisma.user.findUnique({
        where: {
          id: user_id,
        },
        include: {
          contact: {
            include: {
              // Include the most recent message sent or received with each contact
              sentMessages: {
                where: {
                  receiver_id: user_id,
                },
                orderBy: {
                  created_at: "desc",
                },
                take: 1,
              },
              receiveMessages: {
                where: {
                  sender_id: user_id,
                },
                orderBy: {
                  created_at: "desc",
                },
                take: 1,
              },
            },
          },
          user_category: true,
        },
      });

      if (!user) {
        console.error("User not found");
        return res.status(404).json({ error: "User not found" });
      }

        // Flatten the messages and find the latest message for each contact
        const contactsWithMessages = user.contact.map((contact) => {
          const sentMessage = contact.sentMessages[0] || {
            created_at: new Date(0),
          }; // Default to far past date if no message
          const receivedMessage = contact.receiveMessages[0] || {
            created_at: new Date(0),
          };

          // Use the latest message date for sorting
          const latestMessageDate =
            sentMessage.created_at > receivedMessage.created_at
              ? sentMessage.created_at
              : receivedMessage.created_at;

          return {
            ...contact,
            latestMessageDate,
          };
        });

        // Sort contacts based on the latest message date
        const sortedContacts = contactsWithMessages.sort(
          (a, b) => b.latestMessageDate - a.latestMessageDate
        );

        console.log(sortedContacts);
        res.json(sortedContacts);
    } catch (error) {
      console.error("Error while getting contacts:", error);
      res.status(500).json({ error: "Error while getting contacts" });
    }
  },

  async setContactToUser(req, res) {
    const { user_id } = req.params;
    const { contact_id } = req.body;

    console.log("UPDATE", contact_id, user_id);

    try {
      // Verificar se o usuário e o contato existem
      const user = await prisma.user.findUnique({ where: { id: user_id } });
      const contact = await prisma.user.findUnique({
        where: { id: contact_id },
      });

      if (!user || !contact) {
        return res.status(404).json({ error: "User or contact not found" });
      }

      // Adicionar o contato à lista de contatos do usuário
      const updatedUser = await prisma.user.update({
        where: { id: user_id },
        data: {
          contact: {
            connect: { id: contact_id },
          },
        },
        include: {
          contact: true, // Inclui a lista atualizada de contatos na resposta
          user_category: true,
        },
      });

      await prisma.user.update({
        where: { id: contact_id },
        data: {
          contact: {
            connect: { id: user_id },
          },
        },
        include: {
          contact: true, // Inclui a lista atualizada de contatos na resposta
          user_category: true,
        },
      });

      res.json(updatedUser.contacts);
    } catch (error) {
      console.error("Error while adding contact:", error);
      res.status(500).json({ error: "Error while adding contact" });
    }
  },

  async findAllUsers(req, res) {
    try {
      const users = await prisma.user.findMany();
      return res.json(users);
    } catch (error) {
      return res.json({ error });
    }
  },
  async filterAllUsers(req, res) {
    let { query } = req.query;
    
    const removeAccents = (str) => {
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };
    
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required." });
    }
  
    // Remove acentos antes de usar na consulta
    query = removeAccents(query.toLowerCase());
  
    console.log("QUERY", query);
    
    try {
      const users = await prisma.$queryRaw`
        SELECT * FROM "user"
        WHERE 
          (LOWER("username") LIKE ${query + '%'} 
            AND LOWER("name") LIKE ${query + '%'})
          OR LOWER("username") LIKE ${query + '%'}
          OR LOWER("name") LIKE ${query + '%'}
          OR LOWER("username") LIKE ${'%' + query + '%'}
          OR LOWER("name") LIKE ${'%' + query + '%'}
        ORDER BY 
          CASE 
            WHEN LOWER("username") LIKE ${query + '%'}
                 AND LOWER("name") LIKE ${query + '%'} THEN 1
            WHEN LOWER("username") LIKE ${query + '%'} THEN 2
            WHEN LOWER("name") LIKE ${query + '%'} THEN 3
            WHEN LOWER("username") LIKE ${'%' + query + '%'} THEN 4
            ELSE 5
          END
      `;
  
      console.log("USER FILTERED", users);
      return res.json(users);
    } catch (error) {
      console.error("Error filtering users:", error);
      return res.status(500).json({ error: "An error occurred while filtering users." });
    }
  },
  
  async findUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          user_category: true,
          follower: {
            select: {
              follower: { select: { username: true, profile_pic_url: true } },
            },
          },
          following: {
            select: {
              following: { select: { username: true, profile_pic_url: true } },
            },
          },
        },
      });
      if (!user) {
        console.log("nao encontrado");
        return res.json({ error: "User does not exist" });
      }
      return res.json(user);
    } catch (error) {
      return res.json({ error });
    }
  },

  async getFollowers(req, res) {
    try {
      const { id } = req.params;
      const followers = await prisma.following.findMany({
        where: { following_id: id },
        include: {
          follower: {
            select: {
              username: true,
              profile_pic_url: true,
            },
          },
        },
      });
      return res.json(followers);
    } catch (error) {
      return res.json({ error });
    }
  },

  async getFollowingStatus(req, res) {
    try {
      const { visitor_id, user_id } = req.params;
      const check = await prisma.following.findUnique({
        where: {
          follower_id_following_id: {
            follower_id: visitor_id,
            following_id: user_id,
          },
        },
      });
      if (check) {
        return res.json(true);
      } else {
        return res.json(false);
      }
    } catch (error) {
      return res.json({ error });
    }
  },

  async getFollowings(req, res) {
    try {
      const { id } = req.params;
      const following = await prisma.following.findMany({
        where: { follower: { id: id } },
        include: {
          following: {
            select: {
              username: true,
              profile_pic_url: true,
            },
          },
        },
      });
      return res.json(following);
    } catch (error) {
      return res.json({ error });
    }
  },
  async follow(req, res) {
    const { visitor_id, user_id } = req.params;
    try {
      const exists = await prisma.following.findUnique({
        where: {
          follower_id_following_id: {
            follower_id: visitor_id,
            following_id: user_id,
          },
        },
      });
      if (exists) {
        return res.json({ error: "user already follows" });
      } else {
        const following = await prisma.following.create({
          data: {
            follower_id: visitor_id,
            following_id: user_id,
          },
        });

        // const eventOwner = await prisma.event.findUnique({
        //   where: {
        //     id: event_id
        //   },
        //   select: {
        //     user: {
        //       select: {
        //         notificationTokens: true, // Pegando o campo 'token' do usuário
        //       }
        //     },

        //   }

        // })

        if (following) {
          let user = await prisma.user.update({
            where: { id: user_id },
            data: {
              count_followers: {
                increment: 1,
              },
            },
            select: {
              username: true,
              notificationTokens: true,
            },
          });

          //notificação
          console.log("FOLLLOWING", user);

          await prisma.user.update({
            where: { id: visitor_id },
            data: {
              count_following: {
                increment: 1,
              },
            },
          });

          console.log(
            "PPPPPPPPPPPPP",
            user.notificationTokens,
            user.username
          );

          if (user.notificationTokens.length > 0) {
            await Promise.all(
              user.notificationTokens.map(async (token) => {
                await Notification.sendPushNotification(
                  token,
                  `${user.username} começou a seguir você!`
                );
              })
            );
            console.log("Notificações enviadas para todos os tokens");
          }

          return res.json(true);
        }
      }
    } catch (error) {
      return res.json({ error: "error while following user" });
    }
  },

  async unfollow(req, res) {
    const { visitor_id, user_id } = req.params;
    try {
      const following = await prisma.following.findUnique({
        where: {
          follower_id_following_id: {
            follower_id: visitor_id,
            following_id: user_id,
          },
        },
      });
      if (following) {
        const deleted = await prisma.following.delete({
          where: { id: following.id },
        });
        if (deleted) {
          await prisma.user.update({
            where: { id: user_id },
            data: {
              count_followers: {
                decrement: 1,
              },
            },
          });
          await prisma.user.update({
            where: { id: visitor_id },
            data: {
              count_following: {
                decrement: 1,
              },
            },
          });
        }
      }
      return res.json(true);
    } catch (error) {
      return res.json({ error });
    }
  },

  async findUserByUsername(req, res) {
    try {
      const { username } = req.params;
      const user = await prisma.user.findUnique({
        where: {
          username,
        },
      });
      if (!user) {
        return res.status(500).json(null);
      }
      return res.json(user);
    } catch (error) {
      console.log("Error while getting user");
      return res.status(500).json("Error while getting user");
    }
  },

  async findUserByEmail(req, res) {
    try {
      const { email } = req.params;
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (!user) {
        return res.status(500).json(null);
      }
      return res.json(user);
    } catch (error) {
      console.log("Error while getting user");
      return res.status(500).json("Error while getting user");
    }
  },

  async updateUser(req, res) {
    try {
      const { id } = req.params;

      const {
        name,
        username,
        profile_pic_url,
        user_category,
        phone,
        email,
        birth_date,
        description,
      } = req.body;

      let user = await prisma.user.findUnique({ where: { id } });
      if (!user) return res.status(404).json({ error: "User does not exist" });

      user = await prisma.user.update({
        where: { id },
        data: {
          name,
          username,
          profile_pic_url,
          email,
          phone,
          birth_date,
          description,
        },
      });
      return res.json(user);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "It was not possible to update user" });
    }
  },

  async findFollowersByUser(req, res) {
    try {
      const { id } = req.params;
      const followers = await prisma.following.findMany({
        where: { following: Number(id) },
        include: { follower: true },
      });
      return res.json(followers);
    } catch (error) {
      return res.json({ error });
    }
  },
  async findFollowingByUser(req, res) {
    try {
      const { id } = req.params;
      const following = await prisma.following.findMany({
        where: { follower: Number(id) },
        include: { following: true },
      });
      return res.json(following);
    } catch (error) {
      return res.json({ error });
    }
  },

  async deleteUserById(req, res) {
    try {
      const { id } = req.params;
      let user = await prisma.user.findUnique({ where: { id: Number(id) } });
      if (!user) return res.json({ error: "User does not exist" });
      await prisma.user.delete({ where: { id: Number(id) } });
      return res.json({ message: "User deleted" });
    } catch (error) {
      return res.json({ error });
    }
  },

  async updateUserTokens(req, res) {
    try {
      const { expoPushToken } = req.body;
      const { id } = req.params;

      console.log("TOKEN", expoPushToken, id);

      // Obtém o usuário atual para verificar se o token já está na lista
      const user = await prisma.user.findUnique({
        where: { id },
        select: { notificationTokens: true },
      });

      // Verifica se o token já existe para evitar duplicatas
      if (!user.notificationTokens.includes(expoPushToken)) {
        const updatedUser = await prisma.user.update({
          where: { id },
          data: {
            notificationTokens: {
              push: expoPushToken, // Adiciona o novo token ao array existente
            },
          },
        });

        console.log("USER ATUALIZADO", updatedUser);

        return res.status(200).json(updatedUser);
      } else {
        let user = await prisma.user.findUnique({ where: { id } });

        return res.status(200).json(user);
      }
    } catch (error) {
      console.error("EROOOOO", error);
      return res.status(500).json({ error: "Erro ao atualizar tokens" });
    }
  },

  async deleteUserToken(req, res) {
    try {
      const { expoPushToken } = req.query;
      const { id } = req.params;

      // Buscar os tokens atuais do usuário
      const user = await prisma.user.findUnique({
        where: { id },
        select: { notificationTokens: true }, // Seleciona apenas os tokens de notificação
      });
      console.log("Token antes de atualizados", user, expoPushToken);

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      // Filtrar a lista de tokens, removendo o token que deseja deletar
      const updatedTokens = user.notificationTokens.filter(
        (token) => token !== expoPushToken
      );

      // Atualizar a lista de tokens no banco de dados
      const aaa = await prisma.user.update({
        where: { id },
        data: { notificationTokens: updatedTokens }, // Substitui os tokens com a lista atualizada
      });

      console.log("Token atualizados", aaa);
      return res
        .status(200)
        .json({ message: "Token removido com sucesso", updatedTokens });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao remover o token" });
    }
  },
};
