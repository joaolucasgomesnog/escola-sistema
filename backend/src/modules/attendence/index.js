import { prisma } from "../../lib/prisma.js";

export default {
  async createAttendence(req, res) {
    const { student_id, class_id } = req.body;

    try {
      const class_exists = await prisma.class.findUnique({
        where: { id: class_id },
      });
      const student_exists = await prisma.student.findUnique({
        where: { id: student_id },
      });

      if (!class_exists || !student_exists) {
        return res
          .status(404)
          .json({ error: "class ou student nao encontrado" });
      }

      const attendence = await prisma.attendence.create({
        data: {
          studentId: student_id,
          classId: class_id,
        },
      });

      return res.status(201).json(attendence);
    } catch (error) {
      console.error("Error while creating attendence", error);
      res.status(500).json({ error: "Error while creating a new attendence" });
    }
  },

  async getAttendencesByStudentId(req, res) {
    try {
      const { student_id } = req.params;

      const students_exists = await prisma.student.findUnique({
        where: { id: Number(student_id) },
      });

      if (!students_exists) {
        return res.status(404).json({ error: "student not found" });
      }

      const attendences = await prisma.attendence.findMany({
        where: {
          studentId: Number(student_id),
        },
      });

      if (attendences) {
        return res.status(200).json(attendences);
      }
    } catch (error) {
      console.error("Error while getting attendences", error);
      res.status(500).json({ error: "Error while getting attendences" });
    }
  },

  async deleteAttendenceById(req, res) {
    try {
      const { id } = req.params;

      const attendence_deleted = await prisma.attendence.delete({ where: { id: Number(id) } });

      if (attendence_deleted) {
        return res.status(200).json({ attendence_deleted: attendence_deleted.id });
      }

    } catch (error) {
      console.error("Error while deleting attendence", error);
      res.status(500).json({ error: "Error while deleting attendence" });
    }
  },
};
