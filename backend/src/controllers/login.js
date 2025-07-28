const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
const Session = require('../models/session')
const middleware = require('../utils/middleware')
const { EXPIRE_DELAY } = require('../utils/config')
const { expireSession } = require('../utils/expiration_manager')

loginRouter.post('/', async (request, response, next) => {
	try {
		const { username, password } = request.body
		const user = await User.findOne({ username })
		const passwordCorrect = user === null
			? false
			: await bcrypt.compare(password, user.passwordHash)

		if (!(user && passwordCorrect)) {
			return response.status(401).json({
				error: 'invalid username or password'
			})
		}

		const userForToken = { username: user.username, id: user.id }
		const token = jwt.sign(userForToken, process.env.SECRET)
		const session = new Session({ userId: user.id, token })
		await session.save()

		expireSession(session.id)

		response
			.status(200)
			.send({ token, username: user.username, name: user.name, id: user.id })
	} catch (exception) {
		next(exception)
	}
})

loginRouter.get('/', middleware.userExtractor, async (request, response, next) => {
	if (request.user) {
		response.status(200).end()
	}
})

module.exports = loginRouter