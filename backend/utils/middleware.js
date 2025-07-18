const logger = require('./logger')
const User = require('../models/user')
const Session = require('../models/session')
const path = require('path')
const jwt = require('jsonwebtoken')
const multer = require('multer')

const requestLogger = (request, response, next) => {
	request.timestamp = Date.now()
	logger.info('Method:', request.method)
	logger.info('Path:  ', request.path)
	logger.info('Body:  ', request.body)
	logger.info('Timestamp:	', request.timestamp)
	logger.info('---')
	next()
}

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
	logger.error(error.name, error.message)

	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' })
	} else if (error.name === 'ValidationError') {
		return response.status(400).json({ error: error.message })
	} else if (error.name === 'JsonWebTokenError') {
		return response.status(401).json({ error: 'token invalid' })
	} else if (error instanceof multer.MulterError) {
		return response.status(500).json({ error: `Image uploading error: ${error.message}`})
	} else if (error) {
		return response.status(500).json({ error: `Unkown error: ${error.message}`})
	}

	next(error)
}

const tokenExtractor = (request, response, next) => {
	const authorization = request.get('authorization')
	if (authorization && authorization.startsWith('Bearer ')) {
		request.token = authorization.replace('Bearer ', '')
	}
	next()
}

const userExtractor = async (request, response, next) => {
	try {
		if (!request.token) {
			return response.status(401).json({ error: 'token missing' })
		}
		const decodedToken = jwt.verify(request.token, process.env.SECRET)
		if (!decodedToken.id) {
			return response.status(401).json({ error: 'token invalid' })
		}
		const session = await Session.findOne({ token: request.token })
		const user = await User.findById(decodedToken.id)
		if (session && user.id) {
			request.user = user
			session.updatedAt = new Date()
			await session.save()
		} else {
			return response.status(401).json({ error: 'token expired' })
		}
	} catch (exception) {
		next(exception)
	}

	next()
}
const imageUpload = multer({
	storage: multer.diskStorage({
		destination: (request, file, callback) => {
			callback(null, path.join(process.cwd(), '../uploads/'))
		},
		filename: (request, file, callback) => {
			callback(null, request.user.id + '-' + request.timestamp + '.' + file.originalname)
		}
	}),
	limits: { fileSize: 15 * 1024 * 1024 },
	fileFilter: (request, file, callback) => {
		if (["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype)) { 
			callback(null, true)
		}
		else {
			callback(null, false)
			return callback(new Error("Invalid image format."))
		}
	}
}).array('files', 10)

module.exports = {
	requestLogger,
	unknownEndpoint,
	errorHandler,
	tokenExtractor,
	userExtractor,
	imageUpload
}