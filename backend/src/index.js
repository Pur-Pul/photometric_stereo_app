const app = require('./app')
const config = require('./utils/config')
const logger = require('./utils/logger')
const mongoose = require('mongoose')
const { initDatabase } = require('./utils/tools')
const { expireSessions } = require('./utils/expiration_manager')

logger.info(`connecting to ${config.MONGODB_URI}`)

mongoose
    .connect(config.MONGODB_URI)
    .then(() => {
        logger.info('connected to MongoDB')
    })
    .catch((error) => {
        logger.error('error connecting to MongoDB:', error.message)
    })
initDatabase()
expireSessions()

app.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`)
})