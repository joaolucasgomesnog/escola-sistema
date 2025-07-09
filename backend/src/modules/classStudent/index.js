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
        return res.status(404).json({ error: "Class não encontrado" });
      }

      const student = await prisma.student.findUnique({
        where: { id: Number(studentId) },
      });

      if (!student) {
        return res.status(404).json({ error: "Student não encontrado" });
      }
      await prisma.class_Student.deleteMany({
        where: {
          classId: Number(classId),
          studentId: Number(studentId),
        },
      });

      return res.status(204).json({message: "Matricula deletada"});
    } catch (error) {
      console.error("Erro ao deletar classStudent:", error);
      return res
        .status(500)
        .json({ error: "Erro interno ao deletar class_Student" });
    }
  },
};
