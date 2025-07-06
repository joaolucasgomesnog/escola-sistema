import { prisma } from "../../lib/prisma.js";

export default {

  async createCourse(req, res) {
    try {
      const { name, code, monthlyFeeValue, registrationFeeValue } = req.body;

      const courseExists = await prisma.course.findUnique({ where: { code } })

      if (courseExists) {
        return res.status(409).json({ error: 'code informado já foi cadastrado' })
      }

      const course = await prisma.course.create({
        data: {
          name, 
          code: code.toLowerCase(), 
          MonthlyFeeValue: Number(monthlyFeeValue),
          registrationFeeValue: Number(registrationFeeValue)
        }
      });

      return res.status(201).json(course);
    } catch (error) {
      console.error("Erro ao criar course:", error);
      res.status(500).json({ error: "Erro interno ao criar course" });
    }
  },

  // Buscar todos os courses
  async getAllCourses(req, res) {
    
    try {
      const courses = await prisma.course.findMany();
      return res.status(200).json(courses);

    } catch (error) {
      console.error("Erro ao buscar courses:", error);
      return res.status(500).json({ error: "Erro interno ao buscar courses" });
    }
  },

  // Buscar course por ID
  async getCourseById(req, res) {
    try {
      const { id } = req.params

      const course = await prisma.course.findUnique({where: { id: Number(id) }});

      if (!course) {
        return res.status(404).json({ error: "Course não encontrado" });
      }

      return res.status(200).json(course);
    } catch (error) {
      console.error("Erro ao buscar course:", error);
      return res.status(500).json({ error: "Erro interno ao buscar course" });
    }
  },

  async getCourseByCode(req, res) {
    try {
      const { code } = req.params

      const course = await prisma.course.findUnique({where: { code: code.toLowerCase() }});

      if (!course) {
        return res.status(404).json({ error: "Course não encontrado" });
      }

      return res.status(200).json(course);
    } catch (error) {
      console.error("Erro ao buscar course:", error);
      return res.status(500).json({ error: "Erro interno ao buscar course" });
    }
  },

  // Atualizar course
  async updateCourse(req, res) {
    try {

      const { id } = req.params;      

      const { name, code, picture, MonthlyFeeValue, registrationFeeValue } = req.body;

      console.log(req.body)

      const courseExists = await prisma.course.findUnique({ where: { id: Number(id) } })

      if (!courseExists) {
        return res.status(404).json({ error: "Course não encontrado" });
      }

      const updatedCourse = await prisma.course.update({
        where: {
          id: Number(id)
        },
        data: {
          name, 
          code, 
          picture,
          MonthlyFeeValue,
          registrationFeeValue,
        }
      });

      console.log('updatedCourse')
      console.log(updatedCourse)

      return res.status(200).json(updatedCourse);
    } catch (error) {
      console.error("Erro ao atualizar course:", error);
      return res.status(500).json({ error: "Erro interno ao atualizar course" });
    }
  },

  // Deletar course
  async deleteCourse(req, res) {
    try {
      const { id } = req.params;

      const course = await prisma.course.findUnique({
        where: { id: Number(id) },
      });

      if (!course) {
        return res.status(404).json({ error: "Course não encontrado" });
      }

      await prisma.course.delete({
        where: { id: Number(id) },
      });

      return res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar course:", error);
      return res.status(500).json({ error: "Erro interno ao deletar course" });
    }
  },
};

