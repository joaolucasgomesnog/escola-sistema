import { prisma } from "../../lib/prisma.js";
import { parseISO, isValid, startOfDay, endOfDay } from 'date-fns'

export default {

  async createAttendences(req, res) {

    //formato esperado: [ {studentId, classId}, {studentId, classId} ]
    const attendences = req.body;

    if(!Array.isArray(attendences) || attendences.length === 0){
      return res.status(400).json({error: 'A lista de attendences está vazia ou malformada'})
    }

    try {
      
      const result = await prisma.attendence.createMany({
        data: attendences,
        skipDuplicates: true
      })

      return res.status(201).json({count: result.count});

    } catch (error) {
      console.error("Error while creating attendences", error);
      res.status(500).json({ error: "Error while creating a new attendences" });
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
        include: {
          class: {
            select: {
              code: true,
              name: true,
              course: true
              
            }
            
          },
          student: {
            select: {
              name: true,
              cpf: true
            }
          }
          
        }
      });

      if (attendences) {
        return res.status(200).json(attendences);
      }
    } catch (error) {
      console.error("Error while getting attendences", error);
      res.status(500).json({ error: "Error while getting attendences" });
    }
  },

  async getAttendencesByClassDate(req, res) {
    try {
      const { classId, date } = req.body;

      const isValidDate = isValidUTC(date)

      if(!isValidDate){
        return res.status(400).json({error: "invalid date"})
      }

      const parsedDate = new Date(date)

      const start = startOfDay(parsedDate)
      const end = endOfDay(parsedDate)

      const attendences = await prisma.attendence.findMany({
        where: {
          AND: [
              {
                date: {
                  gte: start,
                  lte: end,
                },
              },
              {
                classId: classId,
              },
            ]
          },
          include: {
            student: true
          }

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

function isValidUTC(dateString){
  const date = parseISO(dateString)
  return isValid(date) && dateString.endsWith('Z')
}