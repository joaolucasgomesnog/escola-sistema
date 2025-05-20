import { prisma } from "./../../lib/prisma.js";


// Criar novo Admin
export default {
  async login(req, res) {
    try {
      const { cpf, password } = req.body;

      //fazer login

      res.status(201).json({ cpf, password });
    } catch (error) {
      console.error("Erro ao criar admin:", error);
      res.status(500).json({ error: "Erro interno ao criar admin" });
    }
  },

  async createAdmin(req, res) {
    try {
      const { name, cpf, phone, picture, password, address } = req.body;

      // Criação do endereço
      const newAddress = await prisma.address.create({
        data: address,
      });

      // Criação do admin com vínculo ao endereço
      const admin = await prisma.admin.create({
        data: {
          name,
          cpf,
          phone,
          picture,
          password,
          addressId: newAddress.id,
        },
      });

      res.status(201).json(admin);
    } catch (error) {
      console.error("Erro ao criar admin:", error);
      res.status(500).json({ error: "Erro interno ao criar admin" });
    }
  },
  // Buscar todos os admins
  async getAllAdmins(req, res) {
    try {
      const admins = await prisma.admin.findMany({
        include: { address: true },
      });
      res.status(200).json(admins);
    } catch (error) {
      console.error("Erro ao buscar admins:", error);
      res.status(500).json({ error: "Erro interno ao buscar admins" });
    }
  },
  // Buscar admin por ID
  async getAdminById(req, res) {
    try {
      const { id } = req.params;
      const admin = await prisma.admin.findUnique({
        where: { id: Number(id) },
        include: { address: true },
      });

      if (!admin) {
        return res.status(404).json({ error: "Admin não encontrado" });
      }

      res.status(200).json(admin);
    } catch (error) {
      console.error("Erro ao buscar admin:", error);
      res.status(500).json({ error: "Erro interno ao buscar admin" });
    }
  },

  // Atualizar admin
  async updateAdmin(req, res) {
    try {
      const { id } = req.params;
      const { name, cpf, phone, picture, password, address } = req.body;

      const adminExists = await prisma.admin.findUnique({
        where: { id: Number(id) },
      });

      if (!adminExists) {
        return res.status(404).json({ error: "Admin não encontrado" });
      }

      // Atualiza o endereço, se fornecido
      if (address) {
        await prisma.address.update({
          where: { id: adminExists.addressId },
          data: address,
        });
      }

      const updatedAdmin = await prisma.admin.update({
        where: { id: Number(id) },
        data: { name, cpf, phone, picture, password },
        include: { address: true },
      });

      res.status(200).json(updatedAdmin);
    } catch (error) {
      console.error("Erro ao atualizar admin:", error);
      res.status(500).json({ error: "Erro interno ao atualizar admin" });
    }
  },

  // Deletar admin
  async deleteAdmin(req, res) {
    try {
      const { id } = req.params;

      const admin = await prisma.admin.findUnique({
        where: { id: Number(id) },
      });

      if (!admin) {
        return res.status(404).json({ error: "Admin não encontrado" });
      }

      await prisma.admin.delete({
        where: { id: Number(id) },
      });

      // (Opcional) deletar endereço associado
      // await prisma.address.delete({
      //   where: { id: admin.addressId },
      // });

      res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar admin:", error);
      res.status(500).json({ error: "Erro interno ao deletar admin" });
    }
  },
};
