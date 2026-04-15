export interface Deal {
  id: string
  title: string
  description?: string
  price: number
  originalPrice?: number
  discountPercent?: number
  imageUrl?: string
  imageWidth?: number
  imageHeight?: number
  supermarket: string
  category: string
  validFrom?: string
  validTo?: string
  unit?: string
}

export interface FilterState {
  supermarkets: string[]
  categories: string[]
  minPrice?: number
  maxPrice?: number
  minDiscount?: number
  sortBy: 'price' | 'discount' | 'newest' | 'relevance'
  query: string
}

export interface ApiResponse<T> {
  data: T
  cached: boolean
  cachedAt?: number
  expiresAt?: number
}
