const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
const Session = require('../models/session')
const middleware = require('../utils/middleware')

loginRouter.delete('/', async (request, response, next) => {
	try {
		if (request.token) {
			await Session.deleteMany({ token: request.token })
		}
		response.status(204).end()
	} catch (exception) {
		next(exception)
	}
})

module.exports = loginRouter