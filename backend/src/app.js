const config = require('./utils/config')
const { expireSessions, expireNormalMaps } = require('./utils/expiration_manager')
const express = require('express')
const app = express()
const cors = require('cors')

const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const logoutRouter = require('./controllers/logout')
const normalMapsRouter = require('./controllers/normalMaps')
const internalRouter = require('./controllers/internal')

const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')
logger.info(`connecting to ${config.MONGODB_URI}`)

mongoose
	.connect(config.MONGODB_URI)
	.then(() => {
		logger.info('connected to MongoDB')
	})
	.catch((error) => {
		logger.error('error connecting to MongoDB:', error.message)
    })

expireSessions()
expireNormalMaps()

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/logout', logoutRouter)
app.use('/api/normalMaps', normalMapsRouter)
app.use('/internal', internalRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app