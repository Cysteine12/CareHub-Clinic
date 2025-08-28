import app from './app.js'
import config from './config/config.js'
import prisma from './config/prisma.js'
import logger from './middlewares/logger.js'

const startCronJob = () => import('./cron-job.js')
const PORT = config.PORT || 8000

const startServer = async () => {
  try {
    await prisma.$connect()
    logger.info('Database connected')

    startCronJob()

    app.listen(PORT, '::', () => {
      logger.info(`Server is running on port ${PORT}`)
    })
  } catch (err) {
    logger.error('Unable to connect to the database', err)
    process.exit(1)
  }
}

startServer()

process.on('SIGTERM', async () => {
  logger.info('SIGINT recieved. Closing DB connection...')

  await prisma.$disconnect()
  process.exit(0)
})
