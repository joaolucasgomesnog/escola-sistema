import { prisma } from "../../lib/prisma.js";

export default {

  async createFee(req, res) {
    try {
      const { studentId, price, dueDate, description } = req.body;

      const feeExists = await prisma.fee.findFirst({ where: { studentId } })

      if (feeExists) {
        return res.status(409).json({ error: 'Fee ja existe para esse student' })
      }

      const fee = await prisma.fee.create({
        data: {
          studentId,
          price,
          dueDate,
          description,
        }
      });

      return res.status(201).json(fee);
    } catch (error) {
      console.error("Erro ao criar fee:", error);
      return res.status(500).json({ error: "Erro interno ao criar fee" });
    }
  },

  // Buscar todos os fees
  async getAllFees(req, res) {

    try {
      const fees = await prisma.fee.findMany();
      return res.status(200).json(fees);

    } catch (error) {
      console.error("Erro ao buscar fees:", error);
      return res.status(500).json({ error: "Erro interno ao buscar fees" });
    }
  },


  // Buscar fee por ID
  async getFeeByID(req, res) {
    try {
      const { id } = req.params

      const fee = await prisma.fee.findUnique({ where: { id: Number(id) } });

      if (!fee) {
        return res.status(404).json({ error: "Fee não encontrado" });
      }

      return res.status(200).json(fee);
    } catch (error) {
      console.error("Erro ao buscar fee:", error);
      return res.status(500).json({ error: "Erro interno ao buscar fee" });
    }
  },

  // Atualizar fee
  async updateFee(req, res) {
    try {

      const { id } = req.params;

      const { studentId, price, dueDate, description } = req.body;

      const feeExists = await prisma.fee.findUnique({ where: { id: Number(id) } })

      if (!feeExists) {
        return res.status(404).json({ error: "Fee não encontrado" });
      }

      const updatedFee = await prisma.fee.update({
        where: {
          id: Number(id)
        },
        data: {
          studentId,
          price,
          dueDate,
          description,
        }
      });

      return res.status(200).json(updatedFee);
    } catch (error) {
      console.error("Erro ao atualizar fee:", error);
      return res.status(500).json({ error: "Erro interno ao atualizar fee" });
    }
  },

  // Deletar fee
  async deleteFee(req, res) {
    try {
      const { id } = req.params;

      const fee = await prisma.fee.findUnique({
        where: { id: Number(id) },
      });

      if (!fee) {
        return res.status(404).json({ error: "Fee não encontrado" });
      }

      await prisma.fee.delete({
        where: { id: Number(id) },
      });

      return res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar fee:", error);
      return res.status(500).json({ error: "Erro interno ao deletar fee" });
    }
  },

  async getFeesByStudent(req, res) {
    try {
      const { studentId } = req.params;

      const fees = await prisma.fee.findMany({
        where: {
          studentId: Number(studentId),
        },
        include: {
          payments: { select: { admin: { select: { name: true } }, createdAt: true, paymentType: true } }, // opcional: incluir pagamentos relacionados
        },
        orderBy: [
          { dueDate: 'asc' },
          { id: 'asc' }
        ]
      });

      return res.status(200).json(fees);
    } catch (error) {
      console.error("Erro ao buscar fees do aluno:", error);
      return res.status(500).json({ error: "Erro interno ao buscar fees do aluno" });
    }
  },
};

