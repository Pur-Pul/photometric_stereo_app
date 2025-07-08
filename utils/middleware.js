const logger = require('./logger')
const User = require('../models/user')
const path = require('path')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const { spawn, exec } = require('child_process')

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
	logger.error(error.message)
	logger.error(error.name)

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
		const decodedToken = jwt.verify(request.token, process.env.SECRET)
		if (!decodedToken.id) {
			return response.status(401).json({ error: 'token invalid' })
		}
		request.user = await User.findById(decodedToken.id)
	} catch (exception) {
		errorHandler(exception, request, response, next)
	}

	next()
}
const imageUpload = multer({
	storage: multer.diskStorage({
		destination: (request, file, callback) => {
			callback(null, path.join(__dirname, '../uploads/'))
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


const generateNormalMap = async (request, response, next) => {
	const image_name = request.user.id + '-' + request.timestamp
	const upload_folder = path.join(__dirname, `../uploads`)
	exec(`ls -dq ${upload_folder}/*${image_name}*`, (error, stdout, stderr) => {
		if (error) { next(error) }
		const files = stdout.split('\n')
		console.log(`Files: ${files}`)
	})
	/*
	const process = spawn("python", ['../scripts/normal_map.py', images, name, format])
	const result = await new Promise((resolve, reject) => {
		let output

		process.stdout.on('data', (data) => {
			output = JSON.parse(data)
		})

		process.stderr.on('data', (data) => {
			reject(`An error occured in normal_map.py: ${data}`)
		})

		process.on('exit', (code) => {
			resolve(output)
		})
	})
	return result
	*/
}

module.exports = {
	requestLogger,
	unknownEndpoint,
	errorHandler,
	tokenExtractor,
	userExtractor,
	imageUpload,
	generateNormalMap
}