interface Course{
  image: string | undefined
  id: number
  name: string
  code: string
  picture: string
  registrationFeeValue: float
  MonthlyFeeValue: float
}

export type {Course}