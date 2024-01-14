import { createClient } from 'redis'
import { logger as log, configure as cfg } from './'

const pubClient = createClient({ url: cfg.redisUrl })
const subClient = pubClient.duplicate()

pubClient.on('error', (err) => {
  log.error('pubClient error:', err)
})

subClient.on('error', (err) => {
  log.error('subClient error:', err)
})

const connectRedis = async () => {
  try {
    await Promise.all([pubClient.connect(), subClient.connect()])
    log.debug('Both Redis clients connected successfully')
  } catch (err) {
    log.error('Redis connection error:', err)
    throw err
  }
}

export { pubClient, subClient, connectRedis }
