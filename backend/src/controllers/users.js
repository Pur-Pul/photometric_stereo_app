const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const { ValidationError } = require('../utils/errors')
const middleware = require('../utils/middleware')

usersRouter.get('/', middleware.userExtractor, async (request, response) => {
    const users = request.user.role !== 'admin' ? [request.user] : await User.find({})
    const mappedUsers = Array(users.length)

    for (var i = 0; i < users.length; i++) {
        const user = users[i]
        const mappedUser = {
            id: user.id,
            username: user.username,
            role: user.role,
            normalMaps: user.normalMaps,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
        if (user.id === request.user.id) { mappedUser.name = user.name }
        mappedUsers[i] = mappedUser
    }

    response.json(mappedUsers)
})

usersRouter.post('/', async (request, response, next) => {
    const { username, name, password } = request.body

    try {
        if (password === undefined) { throw new ValidationError('password is required.') }
        if (password.length < 3) { throw new ValidationError('password needs to be atleast 3 characters long.') }

        const passwordHash = await bcrypt.hash(password, 10)

        const user = new User({
            username,
            name,
            passwordHash,
        })

        const existing_user = await User.findOne({ username })
        if (existing_user) { throw new ValidationError('username already exists.') }

        const savedUser = await user.save()
        response.status(201).json(savedUser)
    } catch (exception) {
        next(exception)
    }
})

module.exports = usersRouter