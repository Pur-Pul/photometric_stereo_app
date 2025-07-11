const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
var multer = require('multer');
var upload = multer();

const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const imagesRouter = require('./controllers/images')

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

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/images', imagesRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app