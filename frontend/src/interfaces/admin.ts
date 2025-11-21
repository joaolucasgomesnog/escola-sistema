import { Address } from "./adress"



interface Admin {
  id: number
  name: string
  cpf: string
  phone: string
  picture: string
  addressId: number
  email: string
  address: Address
  attendances: any[]
  observation: string
  birthDate: string | Date
}

export type {Admin}
