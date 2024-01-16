import { App } from 'uWebSockets.js'
import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { logger as log, configure as cfg, pubClient, subClient, connectRedis, Manage } from './utils'

const app = App()
const io = new Server({
  cors: {
    origin: '*',
  },
})
const manage = Manage.getInstance()

io.adapter(createAdapter(pubClient, subClient))
io.attachApp(app)

connectRedis().catch((err) => {
  // Redis接続エラーの処理
  log.error(err)
})

// socket.io global events

const ns = io.of(/ns-\w+$/)

/**
 * socket.io namespace events
 * @namespace ns
 **/
ns.on('connection', (socket) => {
  const namespace = socket.nsp
  const { id } = socket
  log.debug({ namespace: namespace.name, socketId: id }, 'connected')

  socket.on('participate', async (request: unknown) => {
    try {
      const nsKey = `stream:${namespace.name}`
      await pubClient.hSet(nsKey, id, JSON.stringify(request))
      const data = await pubClient.hGetAll(nsKey)
      const users = Object.keys(data).map((key) => JSON.parse(data[key]))
      ns.emit('ns-users', { message: 'participate', users })
    } catch (err) {
      log.error(err)
    }
  })

  // disconnect event
  socket.on('disconnect', async () => {
    await pubClient.hDel(`stream:${namespace.name}`, id)
    const data = await pubClient.hGetAll(`stream:${namespace.name}`)
    const users = Object.keys(data).map((key) => JSON.parse(data[key]))
    ns.emit('ns-users', { message: 'disconnect', users })
  })
})

// uWebSockets.js global events
app.get('/helth', async (res) => {
  res.writeHeader('Content-Type', 'application/json')
  res.writeStatus('200').end(
    JSON.stringify({
      status: 'running',
      date: new Date().toUTCString(),
    })
  )
})

app.listen(cfg.port as number, async (token) => {
  // flush all redis data
  log.info('app listening on port 3000')
  await manage.flush()
  if (!token) {
    log.error('Failed to listen to port 3000.')
  }
})
