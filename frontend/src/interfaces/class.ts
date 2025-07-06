export interface Class {
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

