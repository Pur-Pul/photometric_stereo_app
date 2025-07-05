const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
	const blogs = await User.find({})
	response.json(blogs)
})

usersRouter.post('/', async (request, response, next) => {
	const { username, name, password } = request.body

	try {
		if (password === undefined)
			throw { name: 'ValidationError', message: 'password is required.' }
		if (password.length < 3)
			throw {
				name: 'ValidationError',
				message: 'password needs to be atleast 3 characters long.',
			}

		const passwordHash = await bcrypt.hash(password, 10)

		const user = new User({
			username,
			name,
			passwordHash,
		})

		const existing_user = await User.findOne({ username })
		if (existing_user)
			throw {
				name: 'ValidationError',
				message: 'username already exists',
			}
		const savedUser = await user.save()
		response.status(201).json(savedUser)
	} catch (exception) {
		next(exception)
	}
})

module.exports = usersRouter