import { prisma } from "../../lib/prisma.js";

//NAO PODE USAR CLASS COMO VARIAVEL, É PALAVRA RESERVADA

export default {
  // Deletar classStudent
async deleteClassStudent(req, res) {
  try {
    const { classId, studentId } = req.params;

    const classe = await prisma.class.findUnique({
      where: { id: Number(classId) },
    });

    if (!classe) {
      return res.status(404).json({ error: "Turma não encontrada" });
    }

    const student = await prisma.student.findUnique({
      where: { id: Number(studentId) },
    });

    if (!student) {
      return res.status(404).json({ error: "Estudante não encontrado" });
    }

    // Verifica se existe matrícula
    const matricula = await prisma.class_Student.findFirst({
      where: {
        classId: Number(classId),
        studentId: Number(studentId),
      },
    });

    if (!matricula) {
      return res.status(404).json({ error: "Matrícula não encontrada" });
    }

    // Remove matrícula
    await prisma.class_Student.deleteMany({
      where: {
        classId: Number(classId),
        studentId: Number(studentId),
      },
    });

    // Exclui boletos/fees sem pagamentos
    await prisma.fee.deleteMany({
      where: {
        classId: Number(classId),
        studentId: Number(studentId),
        payments: { none: {} }, // CORREÇÃO
      },
    });

    return res.status(200).json({ message: "Matrícula deletada" });

  } catch (error) {
    console.error("Erro ao deletar classStudent:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao deletar class_Student" });
  }
}

};
