import { identifier } from "@ydbjs/query";
import { loadLastOrders } from "./checkNewOrders";
import { sql } from "../db/ydb";
import { logger } from "../logger";
import { lines as loadMolzLines, OrderLines } from "./molz/api";
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { NalogAPI } from "./nalogAPI";
import { render } from "./email";

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE


const emailTable = identifier('shop/email_confirmation')
const receiptsTable = identifier('shop/receipts')

let client: SESv2Client | null = null;
let nalog: NalogAPI | null = null;

type Order = Awaited<ReturnType<typeof loadLastOrders>>[0];


async function sendEmail(order: Order, keys: OrderLines, receipt: { id: string, url: string } | null) {
  logger.info(`Send email for order ${order.uid} to ${order.email}: ${keys.join(', ')}`, order);

  if (!client) client = new SESv2Client({
    region: 'ru-central1',
    endpoint: 'https://postbox.cloud.yandex.net',
  })

  const emailContent = await render({
    orderId: order.uid,
    name: order.name,
    datetime: order.created,
    totalAmount: order.totalAmount,
    quantity: order.quantity,
    paymentMethod: order.paymentMethod,
    keys: keys,
    receipt: receipt || undefined
  });

  const command = new SendEmailCommand({
    Destination: {
      ToAddresses: ['soprachev@mail.ru'],
    },
    ReplyToAddresses: ['support@wotstat.info'],
    Content: {
      Simple: {
        Subject: { Charset: 'UTF-8', Data: emailContent.subject },
        Body: {
          Html: { Charset: 'UTF-8', Data: emailContent.htmlBody },
          Text: { Charset: 'UTF-8', Data: emailContent.textBody },
        },
      },
    },
    FromEmailAddress: 'WotStat Positions <orders@wotstat.info>',
  });
  const data = await client.send(command);
  return data.MessageId
}

export async function processOrdersSafe() {
  try {
    return await processOrders()
  } catch (e) {
    logger.error('Error processing orders', e)
  }
}

async function createReceipt(options: { amount: number, name: string, quantity: number, date?: Date }): Promise<{ id: string, url: string } | null> {

  try {
    if (!nalog) nalog = new NalogAPI({
      login: Bun.env.NALOG_LOGIN,
      password: Bun.env.NALOG_PASSWORD
    })

    const res = await nalog.addIncome({
      date: options.date || new Date(),
      name: options.name,
      amount: options.amount,
      quantity: options.quantity
    })

    if ('error' in res) {
      logger.error('Nalog api returned error', res.error)
      return null
    }

    return { id: res.id, url: res.printUrl }

  } catch (error) {
    logger.error('Nalog api error', error)
    return null
  }
}

function shouldCreateReceipt(order: Order) {
  return order.paymentMethod == 'yookassa' &&
    order.email == 'soprachev@mail.ru'
}

export async function processOrders() {
  const orders = await loadLastOrders(HOUR * 1)

  const completed = orders.filter(o => o.paymentStatus === 'paid')

  if (completed.length === 0) return logger.debug('No completed orders found')

  const processedResult = await sql<{ orderId: string }[]>`
    select orderId from ${emailTable}
    where orderId in ${completed.map(o => o.uid)}
  `
  const processed = processedResult[0];
  const processedIds = new Set(processed.map(o => o.orderId))
  const newOrders = completed.filter(o => !processedIds.has(o.uid))

  if (newOrders.length === 0) return logger.debug('No new supported completed orders found')

  const generatedReceipts = await sql<{ orderId: string }[]>`
    select orderId from ${receiptsTable}
    where orderId in ${newOrders.map(o => o.uid)}
  `
  const receiptsIds = new Set(generatedReceipts[0].map(o => o.orderId))

  let sended: { orderId: string, confirmation: string, datetime: Date }[] = []
  for (const item of newOrders) {
    let keys: OrderLines = [];
    try { keys = await loadMolzLines(item.uid); }
    catch (e) {
      logger.error(`Error loading keys for order ${item.uid}`, e);
      continue;
    }

    let receipt: { id: string, url: string } | null = null;
    if (shouldCreateReceipt(item) && !receiptsIds.has(item.uid)) {
      try {
        receipt = await createReceipt({
          amount: item.totalAmount / item.quantity,
          name: item.name,
          quantity: item.quantity,
          date: item.created
        });
      } catch (error) {
        logger.error(`Error creating receipt for order ${item.uid}`, error);
      }

      if (receipt) {
        await sql`insert into ${receiptsTable} (orderId, receiptId, url, datetime) values
          (${item.uid}, ${receipt.id}, ${receipt.url}, ${new Date()})
        `;
      }
    }

    try {
      const confirmation = await sendEmail(item, keys, receipt);
      sended.push({ orderId: item.uid, confirmation: confirmation, datetime: new Date() });
    } catch (error) {
      logger.error(`Error sending email for order ${item.uid}`, error);
      continue;
    }
  }

  logger.debug(`Found ${newOrders.length} new completed orders`, newOrders);

  await sql`insert into ${emailTable} select * from AS_TABLE(${sended})`
}
