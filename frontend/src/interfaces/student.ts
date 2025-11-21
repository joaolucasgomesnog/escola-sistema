import { Address } from "./adress"
import { Course } from "./course"
import { Discount } from "./discount"


interface Student {
  id: number
  name: string
  cpf: string
  phone: string
  picture: string
  addressId: number
  email: string
  address: Address
  observation: string
  birthDate: string | Date
  attendances: any[]
  classLinks: any[]
  course: Course
  discountId?: number
  discount?: Discount
}

export type { Student }
