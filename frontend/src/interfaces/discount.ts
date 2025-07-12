import { Student } from "./student";

 interface Discount {
  id: number;
  code: string;
  description: string;
  percentage: number;
  students?: Student[];
}

export type {Discount}