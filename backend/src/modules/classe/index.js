import { prisma } from "../../lib/prisma.js";


//NAO PODE USAR CLASS COMO VARIAVEL, É PALAVRA RESERVADA
//PRECISA SUBSTITUIR
export default {

  async createClass(req, res) {
    try {
      const { code, name, turno, horario, startDate, endDate, courseId, teacherId } = req.body;

      const classExists = await prisma.class.findUnique({ where: { code } })

      if (classExists) {
        return res.status(409).json({ error: 'code informado já foi cadastrado' })
      }

      const class = await prisma.class.create({
        data: {
          code, 
          name, 
          turno, 
          horario, 
          startDate, 
          endDate, 
          courseId, 
          teacherId
        }
      });

      return res.status(201).json(class);
    } catch (error) {
      console.error("Erro ao criar class:", error);
      res.status(500).json({ error: "Erro interno ao criar class" });
    }
  },

  // Buscar todos os classs
  async getAllClasses(req, res) {
    
    try {
      const classes = await prisma.class.findMany();
      return res.status(200).json(classes);

    } catch (error) {
      console.error("Erro ao buscar classes:", error);
      return res.status(500).json({ error: "Erro interno ao buscar classes" });
    }
  },

  // Buscar class por ID
  async getClassByCode(req, res) {
    try {
      const { code } = req.params;
      const class = await prisma.class.findUnique({where: { code }});

      if (!class) {
        return res.status(404).json({ error: "Class não encontrado" });
      }

      return res.status(200).json(class);
    } catch (error) {
      console.error("Erro ao buscar class:", error);
      return res.status(500).json({ error: "Erro interno ao buscar class" });
    }
  },

  // Atualizar class
  async updateClass(req, res) {
    try {

      const { id } = req.params;      

      const { code, name, turno, horario, startDate, endDate, courseId, teacherId } = req.body;

      const classExists = await prisma.class.findUnique({ where: { id: Number(id) } })

      if (!classExists) {
        return res.status(404).json({ error: "Class não encontrado" });
      }

      const updatedClass = await prisma.class.update({
        where: {
          id: Number(id)
        },
        data: {
          code, 
          name, 
          turno, 
          horario, 
          startDate, 
          endDate, 
          courseId, 
          teacherId
        }
      });

      return res.status(200).json(updatedClass);
    } catch (error) {
      console.error("Erro ao atualizar class:", error);
      return res.status(500).json({ error: "Erro interno ao atualizar class" });
    }
  },

  // Deletar class
  async deleteClass(req, res) {
    try {
      const { id } = req.params;

      const class = await prisma.class.findUnique({
        where: { id: Number(id) },
      });

      if (!class) {
        return res.status(404).json({ error: "Class não encontrado" });
      }

      await prisma.class.delete({
        where: { id: Number(id) },
      });

      return res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar class:", error);
      return res.status(500).json({ error: "Erro interno ao deletar class" });
    }
  },
};

