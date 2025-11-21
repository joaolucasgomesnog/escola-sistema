import { Address } from "./adress"


interface Teacher {
  id?: number
  name: string
  cpf: string
  phone: string
  picture: string
  addressId: number
  email: string
  address: Address
  observation: string
  birthDate: string | Date
  Class: any[]
  classLinks: any[]
}

export type { Teacher }
