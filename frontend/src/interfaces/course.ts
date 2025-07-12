interface Course{
  image?: string | undefined
  id?: number
  name: string
  code: string
  picture: string
  registrationFeeValue: number | string
  MonthlyFeeValue: number | string
}

export type {Course}