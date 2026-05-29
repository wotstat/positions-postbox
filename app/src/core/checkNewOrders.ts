import logger from "../logger";
import {
  orders as loadMolzOrders,
  order as loadMolsOrder,
  lines as loadMolzLines, PaymentMethod, PaymentStatus, getPaymentMethod, getPaymentStatus
} from "./molz/api";

const LOAD_PER_PAGE = 30

export async function loadLastOrders(timeLimit: number) {
  let results: {
    uid: string
    totalAmount: number
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
      email: o.buyer_email,
      created: new Date(o.created),
      totalAmount: Number(o.total_amount),
      paymentMethod: getPaymentMethod(o.payment_method),
      paymentStatus: getPaymentStatus(o.payment_status),
      ago: Date.now() - new Date(o.created).getTime(),
    }))

    results.push(...processed)

    lastResultAgo = Math.max(...processed.map(o => o.ago), lastResultAgo)
  }

  return results.filter(o => o.ago <= timeLimit)
}


export async function loadOrderInfo(orderId: string) {
  const order = await loadMolsOrder(orderId);
  const productIds = order.items.map(i => i.product.id);
  const productNames = order.items.map(i => `${i.product_name} x${i.quantity}`).join(', ');
  const quantity = order.items.reduce((sum, i) => sum + i.quantity, 0);

  let keys: string[] = [];
  for (const id of productIds) {
    keys.push(...await loadMolzLines(orderId, id));
  }

  return {
    uid: order.uid,
    email: order.buyer_email,
    created: new Date(order.created),
    totalAmount: Number(order.total_amount),
    paymentMethod: getPaymentMethod(order.payment_method),
    paymentStatus: getPaymentStatus(order.payment_status),
    productName: productNames,
    items: order.items.map(i => ({
      name: i.product_name,
      amount: (Number(i.amount) - Number(i.discount_amount)) / i.quantity,
      quantity: i.quantity
    })),
    quantity,
    keys: keys,
  }
}