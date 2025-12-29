import { Hono } from 'hono'
import { triggerEventMessage } from './core/utils'
import { processOrdersSafe } from './core/processOrders'
import { db } from './db/ydb'
import { logger } from './logger'

const app = new Hono()

await db.ready()

app.post('/check', async (c) => {
  const json = await c.req.json()

  if (!triggerEventMessage(json)) {
    logger.error('No event message found')
    return c.text('')
  }

  if (json.details.payload != 'check') {
    logger.error(`Invalid payload: ${json.details.payload}`)
    return c.text('')
  }

  await processOrdersSafe()

  return c.text('OK')
})

if (Bun.env.LOCAL) processOrdersSafe()

const server = Bun.serve({
  fetch: app.fetch,
})
