import { prisma } from "./../../lib/prisma.js";
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

  async createStudent(req, res) {
    try {
      const { name, cpf, phone, picture, password, address } = req.body;

      if (!name || !cpf || !phone || !password || !address) {
  return res.status(400).json({ error: "Campos obrigatórios não foram preenchidos" });
}
      const studentExists = await prisma.student.findUnique({ where: { cpf:cpf } })

      if(studentExists){
        return res.status(409).json({error: 'cpf informado já foi cadastrado'})
      }
      
      // Criação do endereço
      const newAddress = await prisma.address.create({
        data: address,
      });

      //criptografar senha
      const hashedPassword = await hashPassword(password)

      // Criação do student com vínculo ao endereço
      const student = await prisma.student.create({
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

      res.status(201).json(student);
    } catch (error) {
      console.error("Erro ao criar student:", error);
      res.status(500).json({ error: "Erro interno ao criar student" });
    }
  },

  // Buscar todos os students
  async getAllStudents(req, res) {
    try {
      const students = await prisma.student.findMany({
        include: { address: true },
      });

      const studentsWithoutPassword = students.map(({password, ...rest}) => rest)

      res.status(200).json(studentsWithoutPassword);
    } catch (error) {
      console.error("Erro ao buscar students:", error);
      res.status(500).json({ error: "Erro interno ao buscar students" });
    }
  },
  // Buscar student por ID
  async getStudentById(req, res) {
    try {
      const { id } = req.params;
      const student = await prisma.student.findUnique({
        where: { id: Number(id) },
        include: { address: true },
      });

      if (!student) {
        return res.status(404).json({ error: "Student não encontrado" });
      }

      delete student.password

      res.status(200).json(student);
    } catch (error) {
      console.error("Erro ao buscar student:", error);
      res.status(500).json({ error: "Erro interno ao buscar student" });
    }
  },

  // Atualizar student
  async updateStudent(req, res) {
    try {
      const { id } = req.params;
      const { name, cpf, phone, picture, password, address } = req.body;

      const studentExists = await prisma.student.findUnique({
        where: { id: Number(id) },
      });

      if (!studentExists) {
        return res.status(404).json({ error: "Student não encontrado" });
      }

      // Atualiza o endereço, se fornecido
      if (address) {
        await prisma.address.update({
          where: { id: studentExists.addressId },
          data: address,
        });
      }

      const hashedPassword = await hashPassword(password)

      const updatedStudent = await prisma.student.update({
        where: { id: Number(id) },
        data: { name, cpf, phone, picture, password:hashedPassword },
        include: { address: true },
      });

      delete updatedStudent.password

      res.status(200).json(updatedStudent);
    } catch (error) {
      console.error("Erro ao atualizar student:", error);
      res.status(500).json({ error: "Erro interno ao atualizar student" });
    }
  },

  // Deletar student
  async deleteStudent(req, res) {
    try {
      const { id } = req.params;

      const student = await prisma.student.findUnique({
        where: { id: Number(id) },
      });

      if (!student) {
        return res.status(404).json({ error: "Student não encontrado" });
      }

      await prisma.student.delete({
        where: { id: Number(id) },
      });

      // (Opcional) deletar endereço associado
      // await prisma.address.delete({
      //   where: { id: student.addressId },
      // });

      res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar student:", error);
      res.status(500).json({ error: "Erro interno ao deletar student" });
    }
  },
};

async function hashPassword(password){
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}