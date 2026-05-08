export interface User {
  id: number
  name: string
  email: string
  role: "admin" | "customer"
  cnhNumber: string
  cnhExpiry: string
}

export interface Brand {
  id: number
  name: string
}

export interface Category {
  id: number
  name: string
  description?: string
}

export interface Vehicle {
  id: number
  model: string
  year: number
  plate: string
  color: string
  dailyRate: number
  description?: string
  brandId: number
  categoryId: number
  brand: Brand
  category: Category
}

export interface Rental {
  id: number
  userId: number
  vehicleId: number
  isActive: boolean
  startDate: string
  totalDays: number
  expectedEndDate: string
  returnedAt?: string
  totalAmount?: number
  lateFee?: number
  user: User
  vehicle: Vehicle
}

export interface LoginResponse {
  token: string
}

export interface JwtPayload {
  id: number
  role: "admin" | "customer"
  iat: number
  exp: number
}
