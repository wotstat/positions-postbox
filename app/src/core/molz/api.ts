
const SESSION_ID = Bun.env.MOLZ_SESSION_TOKEN || '26ldqxmbhdzp5avhfn5bhws5r1h5t0is'

export type Orders = {
  results: Array<{
    uid: string
    product: number
    product_name: string
    payment_method: number
    payment_status: number
    quantity: number
    currency: number
    total_amount: string
    buyer_email: string
    buyer_country: string
    created: string
  }>
  paging: {
    limit: number
    page: number
    pages: number
    total: number
  }
}

export type OrderLines = string[]

export type PaymentMethod = 'yookassa' | 'tether' | 'unknown'
export type PaymentStatus = 'pending' | 'paid' | 'canceled' | 'refunded' | 'unknown'

const statusToType: Record<number, PaymentStatus> = {
  1: 'pending',
  2: 'paid',
  3: 'canceled',
  4: 'refunded',
}

const methodToType: Record<number, PaymentMethod> = {
  5: 'yookassa',
  3: 'tether',
}

export function getPaymentMethod(id: number): PaymentMethod {
  return methodToType[id] || 'unknown'
}

export function getPaymentStatus(id: number): PaymentStatus {
  return statusToType[id] || 'unknown'
}

export async function orders(page = 1, limit = 50) {
  const response = await fetch(`https://api.molz.io/v1/orders/?page=${page}&limit=${limit}`, {
    headers: { 'Cookie': `sessionid=${SESSION_ID}` }
  })

  const data = await response.json()

  return data as Orders
}

export async function lines(orderId: string) {
  const response = await fetch(`https://api.molz.io/v1/orders/${orderId}/lines`, {
    headers: { 'Cookie': `sessionid=${SESSION_ID}` }
  })

  const data = await response.json()

  return data as OrderLines
}