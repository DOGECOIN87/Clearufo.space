export interface CreditPack {
  id: string
  credits: number
  price: number
  description: string
}

export interface UserCredits {
  balance: number
  lastUpdated: string
}