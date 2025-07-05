import { prisma } from "../../lib/prisma.js";
import { startOfMonth, endOfMonth, parseISO, isValid } from 'date-fns'

export default {

  async createPayment(req, res) {
    try {
      const { feeId, paymentType, description, adminId } = req.body;


      //verifica se ja existe pagamento no mês do createdAt(que vem do front) e para o feeId
      // Assim pode criar pagamento para meses passados ou atual(atrasados) 
      const paymentExists = await prisma.payment.findFirst({
        where: {
          feeId,
        }
      });

      if (paymentExists) {
        return res.status(409).json({ error: 'Payment já existe para esse feeId no mês informado' });
      }

      const payment = await prisma.payment.create({
        data: {
          feeId,
          paymentType,
          description,
          adminId,
        }
      });

      return res.status(201).json(payment);
    } catch (error) {
      console.error("Erro ao criar payment:", error);
      return res.status(500).json({ error: "Erro interno ao criar payment" });
    }
  },

  // Buscar todos os payments
  async getAllPayments(req, res) {
    try {
      const payments = await prisma.payment.findMany({
        include: {
          admin: { select: { name: true } },
          fee: {
            select: {
              price: true,
              description: true,
              student: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return res.status(200).json(payments);
    } catch (error) {
      console.error("Erro ao buscar payments:", error);
      return res.status(500).json({ error: "Erro interno ao buscar payments" });
    }
  },

  async deletePayment(req, res) {
    const { id } = req.params;
    try {
      const payment = await prisma.payment.delete({
        where: { id: Number(id) },
      });
      if (!payment) {
        return res.status(404).json({ error: "Pagamento não encontrado" });
      }
      return res.status(200).json({ message: "Pagamento deletado com sucesso" });
    } catch (error) {
      console.error("Erro ao buscar Pagamento:", error);
      return res.status(500).json({ error: "Erro interno ao buscar pagamento" });
    }
  },

  async getPaymentReport(req, res) {
    try {
      const { startDate, endDate, adminId, paymentType } = req.query;

      const filters = {};

      if (startDate && endDate) {
        // Início do dia para startDate
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        // Fim do dia para endDate
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        filters.createdAt = {
          gte: start,
          lte: end,
        };
      } else if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        filters.createdAt = {
          gte: start,
        };
      } else if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        filters.createdAt = {
          lte: end,
        };
      }

      if (adminId) {
        filters.adminId = Number(adminId);
      }

      if (paymentType) {
        filters.paymentType = paymentType;
      }

      const payments = await prisma.payment.findMany({
        where: filters,
        include: {
          admin: { select: { name: true } },
          fee: {
            select: {
              price: true,
              description: true,
              student: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return res.status(200).json(payments);
    } catch (error) {
      console.error("Erro ao buscar payments:", error);
      return res.status(500).json({ error: "Erro interno ao buscar payments" });
    }
  },



  // Buscar todos os payments por mes
  async getPaymenstByMonth(req, res) {
    try {

      const { date } = req.params

      const isValidDate = isValidUTC(date)

      if (!isValidDate) {
        return res.status(400).json({ error: "invalid date" })
      }

      const start = startOfMonth(date);
      const end = endOfMonth(date);

      //busca payments criados entre o inicio e fim do date informado
      const payments = await prisma.payment.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      });

      if (payments.length === 0) {
        return res.status(404).json({ error: "0 payments encontrados para o mes informado" });
      }

      return res.status(200).json(payments);
    } catch (error) {
      console.error("Erro ao buscar payment:", error);
      return res.status(500).json({ error: "Erro interno ao buscar payment" });
    }
  },

  // Buscar payments por studentId
  async getPaymentsByStudentID(req, res) {
    try {
      const { student_id } = req.params

      const payments = await prisma.payment.findMany({
        where: {
          fee: {
            studentId: Number(student_id)
          }
        }
      });

      if (payments.length === 0) {
        return res.status(404).json({ error: "0 payments encontrados para o studentId informado" });
      }

      return res.status(200).json(payments);
    } catch (error) {
      console.error("Erro ao buscar payment:", error);
      return res.status(500).json({ error: "Erro interno ao buscar payment" });
    }
  },


};



function isValidUTC(dateString) {
  const date = parseISO(dateString)
  return isValid(date) && dateString.endsWith('Z')
}