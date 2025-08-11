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
    logger.error(error.name, error.message, error)

    if (!error) {next(error)}
    switch(error.name) {
    case 'CastError':
        return response.status(400).send({ error: 'malformatted id' })
    case 'ValidationError':
        return response.status(400).json({ error: error.message })
    case 'JsonWebTokenError':
        return response.status(401).json({ error: 'token invalid' })
    case 'MulterError':
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return response.status(413).json({ error: 'Too many files.' })
        }
        return response.status(500).json({ error: `Image uploading error: ${error.message}` })
    default:
        return response.status(500).json({ error: `Unkown error: ${error.message}` })
    }
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
            const new_name = `${request.user.id}-${request.timestamp}.${file.originalname}`
            request.filenames = request.filenames ? [...request.filenames, new_name] : [new_name]
            request.originalFilenames = request.originalFilenames ? [...request.originalFilenames, file.originalname] : [file.originalname]
            callback(null, new_name)
        }
    }),
    limits: { fileSize: 15 * 1024 * 1024 },
    fileFilter: (request, file, callback) => {
        if (['image/png', 'image/jpg', 'image/jpeg', 'image/bmp'].includes(file.mimetype)) {
            callback(null, true)
        }
        else {
            callback(null, false)
            return callback(new Error('Invalid image format.'))
        }
    }
}).array('files', 15)

module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
    userExtractor,
    imageUpload
}