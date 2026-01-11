import logger from "../logger";
import { orders as loadMolzOrders, PaymentMethod, PaymentStatus, getPaymentMethod, getPaymentStatus } from "./molz/api";

const LOAD_PER_PAGE = 30

export async function loadLastOrders(timeLimit: number) {
  let results: {
    uid: string
    name: string
    totalAmount: number
    quantity: number
    email: string
    created: Date
    paymentMethod: PaymentMethod
    paymentStatus: PaymentStatus
    ago: number
  }[] = []

  let lastResultAgo = 0

  for (let page = 0; page < 20; page++) {
    if (lastResultAgo > timeLimit) break

    const orders = await loadMolzOrders(page + 1, LOAD_PER_PAGE)

    if (!('results' in orders)) {
      logger.error('Error loading orders from Molz', orders);
      break
    }

    const processed = orders.results.map(o => ({
      uid: o.uid,
      name: o.product_name,
      email: o.buyer_email,
      created: new Date(o.created),
      totalAmount: Number(o.total_amount),
      quantity: Number(o.quantity),
      paymentMethod: getPaymentMethod(o.payment_method),
      paymentStatus: getPaymentStatus(o.payment_status),
      ago: Date.now() - new Date(o.created).getTime(),
    }))

    results.push(...processed)

    lastResultAgo = Math.max(...processed.map(o => o.ago), lastResultAgo)
  }

  return results.filter(o => o.ago <= timeLimit)
}