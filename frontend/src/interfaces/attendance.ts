import { Class } from "./class"
import { Student } from "./student"

interface Attendance {
  id: number
  studentId: number
  classId: number
  date: string
  class: Class
  student: Student
}

export type {Attendance}