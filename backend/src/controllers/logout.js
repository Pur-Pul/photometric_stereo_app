const logoutRouter = require('express').Router()
const Session = require('../models/session')
const jwt = require('jsonwebtoken')

logoutRouter.delete('/', async (request, response, next) => {
	try {
		if (request.token) {
			const decodedToken = jwt.verify(request.token, process.env.SECRET)
			const session = decodedToken.id ? await Session.findOne({ token: request.token }) : undefined
			session ? await Session.deleteMany({ userId: session.userId }) : await Session.deleteMany({ token: request.token })
		}
		response.status(204).end()
	} catch (exception) {
		next(exception)
	}
})

module.exports = logoutRouter