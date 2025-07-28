const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const { ValidationError } = require('../utils/errors')

usersRouter.get('/', async (request, response) => {
	const blogs = await User.find({})
	response.json(blogs)
})

usersRouter.post('/', async (request, response, next) => {
	const { username, name, password } = request.body

	try {
		if (password === undefined) {
			throw new ValidationError('password is required.')
		}
			
		if (password.length < 3) {
			throw new ValidationError('password needs to be atleast 3 characters long.')
		}

		const passwordHash = await bcrypt.hash(password, 10)

		const user = new User({
			username,
			name,
			passwordHash,
		})

		const existing_user = await User.findOne({ username })
		if (existing_user) {
			throw new ValidationError('username already exists.')
		}
		const savedUser = await user.save()
		response.status(201).json(savedUser)
	} catch (exception) {
		next(exception)
	}
})

module.exports = usersRouter