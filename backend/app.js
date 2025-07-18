const config = require('./utils/config')
const { expireSessions, expireImages } = require('./utils/expiration_manager')
const express = require('express')
const app = express()
const cors = require('cors')
var multer = require('multer');

const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const logoutRouter = require('./controllers/logout')
const imagesRouter = require('./controllers/images')
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
expireImages()

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/logout', logoutRouter)
app.use('/api/images', imagesRouter)
app.use('/internal', internalRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app