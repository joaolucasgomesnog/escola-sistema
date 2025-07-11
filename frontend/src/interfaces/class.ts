import { Course } from "./course";
import { Student } from "./student";
import { Teacher } from "./teacher";
// Make sure attendance.ts exists in the same directory, or update the path if it's elsewhere.
import { Attendance } from "./attendance";

export interface Class {
  image: string | undefined;
  id: number;
  code: string;
  name: string;
  turno: string;
  horario?: any; // ou você pode tipar melhor, ex: Record<string, any> ou { dia: string; hora: string }[]
  startDate: string; // ou Date, dependendo do uso
  endDate: string;
  createdAt: string;
  updatedAt: string;
  courseId: number;
  teacherId?: number;

  course?: Course;
  teacher?: Teacher;
  students?: Student[];
  attendances?: Attendance[];
}

