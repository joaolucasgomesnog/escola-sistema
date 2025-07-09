import { Student } from "./student";

export interface Discount {
  id: number;
  code: string;
  description: string;
  percentage: number;
  students?: Student[];
}

