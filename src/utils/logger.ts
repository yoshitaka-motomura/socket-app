import pino from 'pino'
import { configure as cfg } from './confg'
const streams = [
  {
    level: 'info',
    stream: process.stdout,
  },
  {
    level: 'error',
    stream: process.stderr,
  },
  {
    level: 'warn',
    stream: process.stderr,
  },
  {
    level: 'fatal',
    stream: process.stderr,
  },
]
export const logger = pino(
  {
    name: cfg.name,
    level: cfg.logLevel,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  },
  pino.multistream(streams)
)
