import { prisma } from "./../../lib/prisma.js";
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

  async createStudent(req, res) {
    try {
      const { name, cpf, phone, email, picture, password, address, birthDate, observation } = req.body;

      console.log(req.body);

      if (!name || !cpf || !phone || !password || !email || !address) {
        return res
          .status(400)
          .json({ error: "Campos obrigatórios não foram preenchidos" });
      }
      const studentExists = await prisma.student.findUnique({
        where: { cpf: cpf },
      });

      if (studentExists) {
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

      // Criação do student com vínculo ao endereço
      const student = await prisma.student.create({
        data: {
          name,
          cpf,
          phone,
          email,
          picture,
          birthDate: birthDate ? new Date(birthDate) : null,
          observation,
          password: hashedPassword,
          addressId: newAddress.id,
        },
        select: {
          id: true,
          name: true,
          cpf: true,
        },
      });

      res.status(201).json(student);
    } catch (error) {
      console.error("Erro ao criar student:", error);
      res.status(500).json({ error: "Erro interno ao criar student" });
    }
  },

  async createClassStudent(req, res) {
    try {
      const { studentId, selectedClasses } = req.body;

      const studentExists = await prisma.student.findUnique({
        where: { id: Number(studentId) },
        include: {
          discount: true, // incluir o desconto se existir
        },
      });

      if (!studentExists) {
        return res.status(409).json({ error: "Estudante não cadastrado" });
      }

      // Cria os vínculos student <-> class
      const studentClasses = selectedClasses.map((classe) => ({
        classId: classe.id,
        studentId: Number(studentId),
      }));

      await prisma.class_Student.createMany({
        data: studentClasses,
      });

      for (const classe of selectedClasses) {
        const classData = await prisma.class.findUnique({
          where: { id: classe.id },
          include: { course: true },
        });

        if (!classData || !classData.course) {
          console.log(`Curso não encontrado para a turma ${classe.id}`);
          continue;
        }

        const registrationFeeValue = classData.course.registrationFeeValue ?? 0;
        let monthlyFeeValue = classData.course.MonthlyFeeValue ?? 0;

        // Verificar se o aluno possui desconto
        if (studentExists.discount) {
          const discountPercentage = studentExists.discount.percentage;
          // Aplicar desconto no valor da mensalidade
          monthlyFeeValue = monthlyFeeValue - (monthlyFeeValue * (discountPercentage / 100));

        }

        const today = new Date();

        // Cria fee de matrícula (sem desconto)
        await prisma.fee.create({
          data: {
            studentId: Number(studentId),
            price: registrationFeeValue,
            classId: classe.id ?? null,
            dueDate: today,
            description: `Matrícula - ${classData.name}`,
          },
        });

        // Cria 5 mensalidades
        for (let i = 1; i <= 5; i++) {
          const dueDate = new Date(today);
          const targetMonth = dueDate.getMonth() + i;
          const targetYear = dueDate.getFullYear();

          let day = today.getDate();
          const tempDate = new Date(targetYear, targetMonth, day);

          if (tempDate.getMonth() !== (targetMonth % 12)) {
            tempDate.setDate(0);
          }

          await prisma.fee.create({
            data: {
              studentId: Number(studentId),
              price: parseFloat(monthlyFeeValue.toFixed(2)),
              classId: classe.id ?? null,
              dueDate: tempDate,
              description: `Mensalidade ${i} - ${classData.name}`,
            },
          });
        }
      }

      return res.status(200).json({ message: "Matrícula efetuada com sucesso e fees criados" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Erro ao matricular estudante" });
    }
  },



  // Buscar todos os students
  async getAllStudents(req, res) {
    try {
      const students = await prisma.student.findMany({
        include: { address: true },
      });

      const studentsWithoutPassword = students.map(
        ({ password, ...rest }) => rest
      );

      res.status(200).json(studentsWithoutPassword);
    } catch (error) {
      console.error("Erro ao buscar students:", error);
      res.status(500).json({ error: "Erro interno ao buscar students" });
    }
  },

  async getAllStudentsByCourseId(req, res) {
    const { courseId } = req.params;

    try {
      const students = await prisma.student.findMany({
        where: {
          classLinks: {
            some: {
              class: {
                courseId: Number(courseId),
              },
            },
          },
        },
      });

      const studentsWithoutPassword = students.map(
        ({ password, ...rest }) => rest
      );

      return res.status(200).json(studentsWithoutPassword);
    } catch (error) {
      console.error("Erro ao buscar students:", error);
      res.status(500).json({ error: "Erro interno ao buscar students" });
    }
  },
  async getAllStudentsByClassId(req, res) {
    const { classId } = req.params;

    try {
      const students = await prisma.class_Student.findMany({
        where: {
          classId: Number(classId)
        },
        select: {
          student: true
        }
      });

      const studentsWithoutPassword = students.map(
        ({ password, ...rest }) => rest.student
      );

      console.log(studentsWithoutPassword)

      return res.status(200).json(studentsWithoutPassword);
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
        include: {
          address: true,
          attendances: true,
          discount: true,
          classLinks: {
            select: {
              class: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  course: {
                    select: {
                      name: true,
                      code: true,
                    },
                  },
                  horario: true,
                  teacher: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!student) {
        return res.status(404).json({ error: "Student não encontrado" });
      }

      delete student.password;

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
      const { name, cpf, password, phone, email, picture, address, birthDate, observation } = req.body;

      console.log("CHEGANDO: ", name, cpf, phone, email, picture, address);

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

      let hashedPassword = studentExists.password;

      if (password && password.trim() !== "") {
        hashedPassword = await hashPassword(password);
      }

      const updatedStudent = await prisma.student.update({
        where: { id: Number(id) },
        data: { name, cpf, phone, email, picture, password: hashedPassword, birthDate: birthDate ? new Date(birthDate) : null, observation },
        include: {
          address: true,
          attendances: true,
          classLinks: {
            select: {
              class: {
                select: {
                  code: true,
                  name: true,
                  course: {
                    select: {
                      name: true,
                      code: true,
                    },
                  },
                  horario: true,
                  teacher: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      delete updatedStudent.password;

      console.log("ATUALIZADO: ", updatedStudent);

      return res.status(200).json(updatedStudent);
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
      return res.status(404).json({ error: "Estudante não encontrado" });
    }

    const classExists = await prisma.class_Student.findFirst({
      where: { studentId: Number(id) },
    });

    if (classExists) {
      return res
        .status(409) 
        .json({ error: "Estudante matriculado em cursos, exclua a matrícula antes" });
    }

    await prisma.student.delete({
      where: { id: Number(id) },
    });

    return res.status(204).send(); // sucesso, sem conteúdo
  } catch (error) {
    console.error("Erro ao deletar student:", error);
    return res.status(500).json({ error: "Erro interno ao deletar estudante" });
  }
},


  async searchStudents(req, res) {
    try {
      const { nome, endereco, bairro, cidade, turma, curso, cpf } = req.query;

      const students = await prisma.student.findMany({
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
          },
          classLinks:
            turma || curso
              ? {
                some: {
                  class: {
                    name: turma
                      ? { contains: turma, mode: "insensitive" }
                      : undefined,
                    course: curso
                      ? {
                        name: { contains: curso, mode: "insensitive" },
                      }
                      : undefined,
                  },
                },
              }
              : undefined,
        },
        include: {
          address: true,
          classLinks: {
            include: {
              class: {
                include: {
                  course: true,
                },
              },
            },
          },
        },
      });

      const studentsWithoutPassword = students.map(
        ({ password, ...rest }) => rest
      );

      res.status(200).json(studentsWithoutPassword);
    } catch (error) {
      console.error("Erro ao buscar estudantes com filtros:", error);
      res.status(500).json({ error: "Erro interno ao buscar estudantes" });
    }
  },

  async addDiscount(req, res) {
    try {
      const { id } = req.params
      const { discountId } = req.body

      console.log(id, discountId)

      const updatedStudent = await prisma.student.update({
        where: { id: Number(id) },
        data: {
          discountId,
        }
      })

      return res.status(200).send();
    } catch (error) {
      console.error("Erro ao atualizar student:", error);
      return res.status(500).json({ error: "Erro interno ao atualizar student" });
    }
  },

  async deleteDiscount(req, res) {
    try {
      const { id } = req.params

      console.log(id)
      const updatedStudent = await prisma.student.update({
        where: { id: Number(id) },
        data: {
          discountId: null
        }
      })

      return res.status(200).send();
    } catch (error) {
      console.error("Erro ao atualizar student:", error);
      return res.status(500).json({ error: "Erro interno ao atualizar student" });
    }
  }
}

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}
