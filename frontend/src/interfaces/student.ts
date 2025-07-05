import { Address } from "./adress"
import { Course } from "./course"


interface Student {
  id: number
  name: string
  cpf: string
  phone: string
  picture: string
  addressId: number
  email: string
  address: Address
  attendances: any[]
  classLinks: any[]
  course: Course
}

export type {Student}
