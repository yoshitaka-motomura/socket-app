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

interface RedisManage {
  clients(): void
  flush(): Promise<void>
  setItem(key: string, value: string): Promise<void>
  fetchItems(): Promise<void>
  deleteItem(): Promise<void>
  singleton(): RedisManage
}

class Manage implements RedisManage {
  constructor() {}
  public clients() {}
  public async flush() {
    await pubClient.flushAll()
  }
  public async setItem(key: string, value: string) {
    await pubClient.set(key, value)
  }
  public async fetchItems() {}
  public async deleteItem() {}
  public singleton() {
    return this
  }
}

export { pubClient, subClient, connectRedis, Manage }
