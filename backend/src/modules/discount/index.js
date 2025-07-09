import { prisma } from "../../lib/prisma.js";

export default {

  async createDiscount(req, res) {
    try {
      const { description, percentage, code } = req.body;

      const discountExists = await prisma.discount.findFirst({ where: { code } })

      if (discountExists) {
        return res.status(409).json({ error: 'Discount ja existe' })
      }

      const discount = await prisma.discount.create({
        data: {
          description,
          percentage,
          code
        }
      });

      return res.status(201).json(discount);
    } catch (error) {
      console.error("Erro ao criar discount:", error);
      return res.status(500).json({ error: "Erro interno ao criar discount" });
    }
  },

  // Buscar todos os discounts
  async getAllDiscounts(req, res) {

    try {
      const discounts = await prisma.discount.findMany();
      return res.status(200).json(discounts);

    } catch (error) {
      console.error("Erro ao buscar discounts:", error);
      return res.status(500).json({ error: "Erro interno ao buscar discounts" });
    }
  },


  // Buscar discount por ID
  async getDiscountByID(req, res) {
    try {
      const { id } = req.params

      const discount = await prisma.discount.findUnique({ where: { id: Number(id) } });

      if (!discount) {
        return res.status(404).json({ error: "Discount não encontrado" });
      }

      return res.status(200).json(discount);
    } catch (error) {
      console.error("Erro ao buscar discount:", error);
      return res.status(500).json({ error: "Erro interno ao buscar discount" });
    }
  },

  // Atualizar discount
  async updateDiscount(req, res) {
    try {

      const { id } = req.params;

      const { code, percentage, description } = req.body;

      const discountExists = await prisma.discount.findUnique({ where: { id: Number(id) } })

      if (!discountExists) {
        return res.status(404).json({ error: "Discount não encontrado" });
      }

      const updatedDiscount = await prisma.discount.update({
        where: {
          id: Number(id)
        },
        data: {
          description,
          code,
          percentage
        }
      });

      return res.status(200).json(updatedDiscount);
    } catch (error) {
      console.error("Erro ao atualizar discount:", error);
      return res.status(500).json({ error: "Erro interno ao atualizar discount" });
    }
  },

  // Deletar discount
  async deleteDiscount(req, res) {
    try {
      const { id } = req.params;

      const discount = await prisma.discount.findUnique({
        where: { id: Number(id) },
      });

      if (!discount) {
        return res.status(404).json({ error: "Discount não encontrado" });
      }

      await prisma.discount.delete({
        where: { id: Number(id) },
      });

      return res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar discount:", error);
      return res.status(500).json({ error: "Erro interno ao deletar discount" });
    }
  },

  async getDiscountsByStudent(req, res) {
    try {
      const { studentId } = req.params;

      const discounts = await prisma.student.findMany({
        where: {
          id: Number(studentId),
        },
        include: {
          discount: true
        },

      });

      return res.status(200).json(discounts);
    } catch (error) {
      console.error("Erro ao buscar discounts do aluno:", error);
      return res.status(500).json({ error: "Erro interno ao buscar discounts do aluno" });
    }
  },
};

