import 'dotenv/config'
export const configure = {
  name: process.env.APP_NAME || 'socket-io',
  port: process.env.PORT || 3000,
  logLevel: process.env.LOG_LEVEL || 'debug',
  redisUrl: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/${process.env.REDIS_DB}` || '',
}
