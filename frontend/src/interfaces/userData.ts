import { Attendance } from "./attendance";
import { Course } from "./course";
import { Student } from "./student";
import { Teacher } from "./teacher";
// Make sure attendance.ts exists in the same directory, or update the path if it's elsewhere.

interface UserData  {
  name: string;
  role: string;
  picture?: string;
};

export type {UserData}