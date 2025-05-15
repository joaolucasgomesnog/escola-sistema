import { prisma } from "../../lib/prisma.js";
import haversineDistance from 'haversine-distance' // Para calcular a distância entre duas coordenadas


export default {
  async createEvent(req, res) {
    let event_id = 0;
    const {
      title,
      description,
      event_date,
      created_at,
      user_id,
      privacy_id,
      category_id,
      address,
      latitude,
      longitude
    } = req.body;
  
    try {
      const eventData = {
        title,
        description,
        event_date,
        created_at,
        user: {
          connect: {
            id: user_id,
          },
        },
        privacy: {
          connect: {
            id: privacy_id,
          },
        },
        eventCategory: {
          connect: {
            id: category_id,
          },
        },
      };
  
      // Verifica se latitude e longitude são fornecidos
      if (latitude && longitude) { //NAO EXCLUA ISSO, SENAO DA BUG NA HORA DE CRIAR EVENTO SEM LOCALIZAÇÃO
        eventData.location = {
          create: {
            address: address || null,
            latitude: latitude,
            longitude: longitude
          },
        };
      }
  
      const event = await prisma.event.create({
        data: eventData,
      });
  
      res.json(event);
      event_id = event.id;
    } catch (error) {
      console.error("Erro while creating event", error);
      res.status(500).json({ error: "Erro while creating event" });
      return; // Para evitar que a próxima tentativa de criação ocorra após erro
    }
  
    try {
      const participant = await prisma.eventParticipant.create({
        data: {
          event_id,
          user_id
        },
      });
      console.log(participant);
    } catch (error) {
      console.error("Erro while creating participant", error);
      res.status(500).json({ error: "Erro while creating a new participant" });
    }
  },
  
  async deleteEvent(req, res) {
    const { id } = req.params;
    const event_id = parseInt(id);
  
    const event_exists = await prisma.event.findUnique({ where: { id: event_id } });
    if (!event_exists) {
      return res.status(404).json({ error: "Event not found" });
    }
  
    try {
      // Primeiro, excluir todos os participantes relacionados ao evento
      await prisma.eventParticipant.deleteMany({
        where: {
          event_id: event_id,
        },
      });
  
      // Agora, excluir o evento
      const deleted_event = await prisma.event.delete({
        where: {
          id: event_id,
        },
      });
  
      res.json(deleted_event);
    } catch (error) {
      console.error("Error while deleting event", error);
      res.status(500).json({ error: "Error while deleting event", details: error });
    }
  },
  


  async updateEvent(req, res) {
    const { id } = req.params;

    const event_id = parseInt(id);

    const {
      title,
      description,
      event_date,
      user_id,
      privacy_id,
      category_id,
      address,
      latitude,
      longitude
    } = req.body;

    const event_exists = await prisma.event.findUnique({
      where: { id: event_id },
    });
    if (!event_exists) {
      res.status(500).json({ erro: "Event not found" });
    }

    try {
      const updated_event = await prisma.event.update({
        where: {
          id: event_id,
        },
        data: {
          title,
          description,
          event_date,
          user: {
            connect: {
              id: user_id,
            },
          },
          privacy: {
            connect: {
              id: privacy_id,
            },
          },
          eventCategory: {
            connect: {
              id: category_id,
            },
          },
          location: { //nao exclua isso
            create: {
              address: address || null,
              latitude: latitude,
              longitude: longitude
            },
          }

        },
      });
      res.json(updated_event);
    } catch (error) {
      console.error("Erro while updating event", error);
      res.status(500).json({ erro: "Erro while updating event", error });
    }
  },
  async findEventById(req, res) {
    try {
      const { id } = req.params;
      const event = await prisma.event.findUnique({
        where: { id: Number(id), include: { location: true, privacy: true } },
      });
      if (!event) return res.json({ error: "Event does not exist" });
      return res.json(event);
    } catch (error) {
      return res.json({ error });
    }
  },
  async findAllEventsByUser(req, res) {
    try {
      const { id } = req.params;
      const event = await prisma.event.findMany({
        where: { user_id: id },
        include: { location: true, privacy: true },
      });
      if (!event) return res.json({ error: "Event does not exist" });
      return res.json(event);
    } catch (error) {
      return res.json({ error });
    }
  },

  async findAllEventsByPrivacy(req, res) {
    try {
      const { id } = req.params;
      const event = await prisma.event.findMany({
        where: {
          privacy_id: Number(id),
          include: { location: true, privacy: true },
        },
      });
      if (!event) return res.json({ error: "Event does not exist" });
      return res.json(event);
    } catch (error) {
      return res.json({ error });
    }
  },
  async findAllEvents(req, res) {
    //erro de segurança, futuramente esse método vai ser alterado, por enquanto é só pra ir testando o mapa
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const event = await prisma.event.findMany({
        include: { 
          location: true, 
          privacy: true, 
          eventCategory: true, 
          user: {
            select: {
              name: true,
              profile_pic_url: true,
              
            }
          },
          _count: {
            select: {
              EventParticipant: true
            }
          }
        },
        where:{
          event_date: {
            gte: startOfDay
          },
          privacy: {
            id: 3
          }
        }

      }); //apenas simulação, no futuro vai ser pego somente public e friends-only
      if (!event) return res.json({ error: "Event does not exist" });
      return res.json(event);
    } catch (error) {
      return res.json({ error });
    }
  },

  async findAllEventsByDate(req, res) {
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
      // Fetch events within the start and end of the day
      const events = await prisma.event.findMany({
        where: {
          user_id,
          event_date: {
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
              EventParticipant: true,
            },
          },
        },
      });
  
      const participantEvents = await prisma.eventParticipant.findMany({
        where: {
          user_id,
          event: {
            event_date: {
              gte: startOfDay,
              lte: endOfDay,
            },
            user_id: {
              not: user_id,
            },
          },
        },
        include: {
          event: {
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
                  EventParticipant: true,
                },
              },
            },
          },
        },
      });
  
      // Combine both sets of events
      const allEvents = [
        ...events,
        ...participantEvents.map(participant => participant.event),
      ];
  
      // Ordenar os eventos pela data, começando pela meia-noite
      allEvents.sort((a, b) => {
        const eventADate = new Date(a.event_date).getTime();
        const eventBDate = new Date(b.event_date).getTime();
        return eventADate - eventBDate; // Ordem crescente
      });
  
      if (!allEvents || allEvents.length === 0) {
        return res.json({ error: "No events found for this date" });
      }
  
      return res.json(allEvents);
    } catch (error) {
      console.log('Error while processing events', error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  
  async findAllCategories(req, res) {
    try {
      const categories = await prisma.eventCategory.findMany();
      if (!categories) return res.json({ error: "No categories" });
      return res.json(categories);
    } catch (error) {
      return res.json({ error });
    }
  },


  async findNearbyEvents(req, res) {
  try {
    const { latitude, longitude, radius } = req.query; // Pegar a latitude e longitude do usuário via query params
    const userLocation = { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
    
    console.log('AAAAAAA',latitude, longitude)
    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Latitude and Longitude are required" });
    }

    const currentDate = new Date();
    const startOfToday = new Date(currentDate.setUTCHours(0, 0, 0, 0)); // Início do dia atual
    const endOfToday = new Date(currentDate.setUTCHours(23, 59, 59, 999)); // Fim do dia atual

    // Buscar eventos que são de hoje e que possuem hora futura
    const events = await prisma.event.findMany({
      where: {
        event_date: {
          gte: startOfToday, // Eventos de hoje ou depois do início do dia
          lte: endOfToday, // Eventos até o fim do dia
        },
        privacy: {
          id: 3
        }
      },
      include: {
        location: true,
        privacy: true, 
        eventCategory: true, 
        user: {
          select: {
            name: true,
            profile_pic_url: true,
          }
        },
        _count: {
          select: {
            EventParticipant: true
          }
        }
      }
    });

    console.log("eventos --- ", events)
    // Filtrar eventos que estão dentro do raio especificado
    const nearbyEvents = events.filter(event => {
      if (event.location) {
        const eventLocation = { latitude: event.location.latitude, longitude: event.location.longitude };
        const distance = haversineDistance(userLocation, eventLocation) / 1000; // Converte a distância para quilômetros
        return distance <= radius;
      }
      return false;
    });

    // Ordenar os eventos pela data e hora
    nearbyEvents.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

    res.json(nearbyEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching nearby events" });
  }
}

  
  
};
