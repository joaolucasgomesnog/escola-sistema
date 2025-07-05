import { prisma } from "../../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET;

export default {
  async logout(req, res) {
    try {
      const { token } = req.body;

      console.log(token);

      await prisma.blackListToken.create({ data: { token } });

      return res.status(200).json({ message: "token adicionado a blackList" });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      res.status(500).json({ error: "Erro interno ao fazer logout" });
    }
  },

  async createTeacher(req, res) {
    try {
      const { name, cpf, phone, picture, password, address } = req.body;

      const teacherExists = await prisma.teacher.findUnique({ where: { cpf } });

      if (teacherExists) {
        return res
          .status(409)
          .json({ error: "cpf informado já foi cadastrado" });
      }

      // Criação do endereço
      const newAddress = await prisma.address.create({
        data: address,
      });

      //criptografar senha
      const hashedPassword = await hashPassword(password);

      // Criação do teacher com vínculo ao endereço
      const teacher = await prisma.teacher.create({
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
          cpf: true,
        },
      });

      res.status(201).json(teacher);
    } catch (error) {
      console.error("Erro ao criar teacher:", error);
      res.status(500).json({ error: "Erro interno ao criar teacher" });
    }
  },

  // Buscar todos os teachers
  async getAllTeachers(req, res) {
    try {
      const teachers = await prisma.teacher.findMany({
        include: { address: true },
      });

      const teachersWithoutPassword = teachers.map(
        ({ password, ...rest }) => rest
      );

      res.status(200).json(teachersWithoutPassword);
    } catch (error) {
      console.error("Erro ao buscar teachers:", error);
      res.status(500).json({ error: "Erro interno ao buscar teachers" });
    }
  },
  // Buscar teacher por ID


async getTeacherById(req, res) {
  try {
    const { id } = req.params;

    const teacher = await prisma.teacher.findUnique({
      where: { id: Number(id) },
      include: {
        address: true,
        Class: {
          select: {
            code: true,
            name: true,
            turno: true,
            horario: true,
            course: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    if (!teacher) {
      return res.status(404).json({ error: "Professor não encontrado" });
    }

    // Remove a senha antes de retornar
    delete teacher.password;

    res.status(200).json(teacher);
  } catch (error) {
    console.error("Erro ao buscar teacher:", error);
    res.status(500).json({ error: "Erro interno ao buscar professor" });
  }
},


  // Atualizar teacher
  async updateTeacher(req, res) {
    try {
      const { id } = req.params;
      const { name, cpf, phone, email, picture, address } = req.body;

      const teacherExists = await prisma.teacher.findUnique({
        where: { id: Number(id) },
      });

      if (!teacherExists) {
        return res.status(404).json({ error: "Teacher não encontrado" });
      }

      // Atualiza o endereço, se fornecido
      if (address) {
        await prisma.address.update({
          where: { id: teacherExists.addressId },
          data: address,
        });
      }

      // const hashedPassword = await hashPassword(password);

      const updatedTeacher = await prisma.teacher.update({
        where: { id: Number(id) },
        data: { name, cpf, phone, picture, email },
        include: { address: true },
      });

      delete updatedTeacher.password;

      res.status(200).json(updatedTeacher);
    } catch (error) {
      console.error("Erro ao atualizar teacher:", error);
      res.status(500).json({ error: "Erro interno ao atualizar teacher" });
    }
  },

  // Deletar teacher
  async deleteTeacher(req, res) {
    try {
      const { id } = req.params;

      const teacher = await prisma.teacher.findUnique({
        where: { id: Number(id) },
      });

      if (!teacher) {
        return res.status(404).json({ error: "Teacher não encontrado" });
      }

      await prisma.teacher.delete({
        where: { id: Number(id) },
      });

      // (Opcional) deletar endereço associado
      // await prisma.address.delete({
      //   where: { id: teacher.addressId },
      // });

      res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar teacher:", error);
      res.status(500).json({ error: "Erro interno ao deletar teacher" });
    }
  },
};

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}
