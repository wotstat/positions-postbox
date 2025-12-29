enum LogLevel {
  UNSPECIFIED = 'UNSPECIFIED',
  TRACE = 'TRACE',
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

function errorToObject(error: Error) {
  const errorObject: any = {}
  Object.getOwnPropertyNames(error).forEach((key) => {
    errorObject[key] = (error as any)[key]
  })
  return errorObject
}

class Logger {
  log: (level: LogLevel, message: string, payload?: any) => void

  constructor() {
    if (process.env.LOG_VARIANT === 'JSON') {
      this.log = (level: LogLevel, message: string, payload?: any) => {
        if (payload instanceof Error) {
          console.log(JSON.stringify({ level: level.toString(), message, payload: errorToObject(payload) }))
        } else {
          console.log(JSON.stringify({ level: level.toString(), message, payload }))
        }
      }
    } else {
      this.log = (level: LogLevel, message: string, payload?: any) => {
        if (payload) {
          console.log(`[${level.toString()}] ${message}`, payload)
        } else {
          console.log(`[${level.toString()}] ${message}`)
        }
      }
    }
  }

  unspec(message: string, payload?: any) {
    this.log(LogLevel.UNSPECIFIED, message, payload)
  }

  trace(message: string, payload?: any) {
    this.log(LogLevel.TRACE, message, payload)
  }

  debug(message: string, payload?: any) {
    this.log(LogLevel.DEBUG, message, payload)
  }

  info(message: string, payload?: any) {
    this.log(LogLevel.INFO, message, payload)
  }

  warn(message: string, payload?: any) {
    this.log(LogLevel.WARN, message, payload)
  }

  error(message: string, payload?: any) {
    this.log(LogLevel.ERROR, message, payload)
  }

  fatal(message: string, payload?: any) {
    this.log(LogLevel.FATAL, message, payload)
  }
}

export const logger = new Logger()

export function trace(message: string, payload?: any) {
  logger.trace(message, payload)
}

export function debug(message: string, payload?: any) {
  logger.debug(message, payload)
}

export function info(message: string, payload?: any) {
  logger.info(message, payload)
}

export function warn(message: string, payload?: any) {
  logger.warn(message, payload)
}

export function error(message: string, payload?: any) {
  logger.error(message, payload)
}

export function fatal(message: string, payload?: any) {
  logger.fatal(message, payload)
}

export default logger
