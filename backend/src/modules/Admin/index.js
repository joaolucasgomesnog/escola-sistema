import { prisma } from "../../lib/prisma.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const SECRET_KEY = process.env.JWT_SECRET; 

export default {

  async logout(req, res){
    try {
      const {token} = req.body

      console.log(token)

      await prisma.blackListToken.create({ data: {token}})

      return res.status(200).json({message: "token adicionado a blackList"})

    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      res.status(500).json({ error: "Erro interno ao fazer logout" });
    }
  },

  async createAdmin(req, res) {
    try {
      const { name, cpf, phone, picture, password, address } = req.body;

      const adminExists = await prisma.admin.findUnique({ where: { cpf } })

      if(adminExists){
        return res.status(409).json({error: 'cpf informado já foi cadastrado'})
      }
      
      // Criação do endereço
      const newAddress = await prisma.address.create({
        data: address,
      });

      //criptografar senha
      const hashedPassword = await hashPassword(password)

      // Criação do admin com vínculo ao endereço
      const admin = await prisma.admin.create({
        data: {
          name,
          cpf,
          phone,
          picture,
          password: hashedPassword,
          addressId: newAddress.id,
        },
        select: {
          id: true,
          name: true,
          cpf: true
        }
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

      const adminsWithoutPassword = admins.map(({password, ...rest}) => rest)

      res.status(200).json(adminsWithoutPassword);
    } catch (error) {
      console.error("Erro ao buscar admins:", error);
      res.status(500).json({ error: "Erro interno ao buscar admins" });
    }
  },

    async getAllNames(req, res) {
    try {
      const admins = await prisma.admin.findMany({
        select: {
          id: true,
          name: true
        }
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

      delete admin.password

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

      const hashedPassword = await hashPassword(password)

      const updatedAdmin = await prisma.admin.update({
        where: { id: Number(id) },
        data: { name, cpf, phone, picture, password:hashedPassword },
        include: { address: true },
      });

      delete updatedAdmin.password

      res.status(200).json(updatedAdmin);
    } catch (error) {
      console.error("Erro ao atualizar admin:", error);
      res.status(500).json({ error: "Erro interno ao atualizar admin" });
    }
  },


  async searchAdmin(req, res) {
    try {
      const { nome, endereco, bairro, cidade, cpf } = req.query;

      const admins = await prisma.admin.findMany({
        where: {
          name: nome ? { contains: nome, mode: "insensitive" } : undefined,
          cpf: cpf ? { contains: cpf } : undefined,
          address: {
            AND: [
              endereco
                ? { street: { contains: endereco, mode: "insensitive" } }
                : {},
              bairro
                ? { neighborhood: { contains: bairro, mode: "insensitive" } }
                : {},
              cidade ? { city: { contains: cidade, mode: "insensitive" } } : {},
            ],
          }
        },
        include: {
          address: true
        },
      });

      const adminsWithoutPassword = admins.map(
        ({ password, ...rest }) => rest
      );

      res.status(200).json(adminsWithoutPassword);
    } catch (error) {
      console.error("Erro ao buscar administradores com filtros:", error);
      res.status(500).json({ error: "Erro interno ao buscar administradores" });
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

async function hashPassword(password){
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}