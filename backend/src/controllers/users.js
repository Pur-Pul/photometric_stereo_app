const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const Session = require('../models/session')
const NormalMap = require('../models/normalMap')
const { ValidationError } = require('../utils/errors')
const middleware = require('../utils/middleware')
const { expireNormalMap, expireSession } = require('../utils/expiration_manager')
const jwt = require('jsonwebtoken')

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
        if (user.id.toString() === request.user.id.toString()) { mappedUser.name = user.name }
        mappedUsers[i] = mappedUser
    }

    response.json(mappedUsers)
})

usersRouter.get('/verify-email', middleware.tokenExtractor, async (request, response, next) => {
    try {
        const token = request.token
        if (!token) { return response.status(401).json({ error: 'token missing' }) }
        const decodedToken = jwt.verify(token, process.env.SECRET)
        if (!decodedToken.id) { return response.status(401).json({ error: 'token invalid' }) }
        const session = await Session.findOne({ token })
        const user = await User.findById(decodedToken.id)
        console.log(user, session)
        if (!session || !user.id) { return response.status(401).json({ error: 'token expired' }) }
        
        session.updatedAt = new Date()
        await session.save()

        user.updatedAt = new Date()
        user.verified = true
        await user.save()

        await expireSession(session.id, true)
        
        response.status(200).end()
    } catch (exception) {
        next(exception)
    }
})

usersRouter.post('/', async (request, response, next) => {
    const { username, email, name, password } = request.body
    try {
        if (password === undefined) { throw new ValidationError('password is required.') }
        if (password.length < 3) { throw new ValidationError('password needs to be atleast 3 characters long.') }

        const passwordHash = await bcrypt.hash(password, 10)

        const user = new User({
            username,
            email,
            name,
            passwordHash,
        })

        const existing_user = await User.findOne({ username })
        if (existing_user) { throw new ValidationError('username already exists.') }
        const userForToken = { username: user.username, id: user.id }
        const token = jwt.sign(userForToken, process.env.SECRET)
        const session = new Session({ userId: user.id, token})
        session.save()
        expireSession(session.id)
        console.log(token)

        const savedUser = await user.save()
        response.status(201).json(savedUser)
    } catch (exception) {
        next(exception)
    }
})

usersRouter.put('/:id', middleware.userExtractor, async (request, response, next) => {
    try {
        const userToUpdate = await User.findById(request.params.id)
        if (!userToUpdate) { return response.status(404).end() }
        const isAdmin = request.user.role === 'admin'
        if (userToUpdate.id !== request.user.id && !isAdmin) { return response.status(403).end() }

        const { 
            username,
            name,
            role,
            normalMaps,
            password
        } = request.body ? request.body : { 
            username: null,
            name: null,
            role: null,
            normalMaps: null,
            password: null
        }

        const passwordHash = password ? await bcrypt.hash(password, 10) : null

        userToUpdate.username       = username          ? username       : userToUpdate.username,
        userToUpdate.name           = name              ? name           : userToUpdate.name,
        userToUpdate.role           = role && isAdmin   ? role           : userToUpdate.role,
        userToUpdate.normalMaps     = normalMaps        ? normalMaps     : userToUpdate.normalMaps
        userToUpdate.passwordHash   = passwordHash      ? passwordHash   : userToUpdate.passwordHash
        userToUpdate.updatedAt = new Date()

        await userToUpdate.save()
        const updatedUser = {
            id: userToUpdate.id,
            username: userToUpdate.username,
            role: userToUpdate.role,
            normalMaps: userToUpdate.normalMaps,
            updatedAt: userToUpdate.updatedAt,
            createdAt: userToUpdate.createdAt
        }
        if (userToUpdate.id === request.user.id) { updatedUser.name = userToUpdate.name }
        response.status(201).json(updatedUser)

    } catch (excpetion) {
        next(excpetion)
    }
})

usersRouter.delete('/:id', middleware.userExtractor, async (request, response, next) => {
    try {
        const userToDelete = await User.findById(request.params.id)
        if (!userToDelete) { return response.status(404).end() }
        if (userToDelete.id !== request.user.id && request.user.role !== 'admin') { return response.status(403).end() }

        //const { password } = request.body ? request.body : { password: null }
        //if (!password) { return response.status(401).json({ error: 're-authentication required'}) }

        //const passwordCorrect = await bcrypt.compare(password, request.user.passwordHash)
        //if (!passwordCorrect) { return response.status(401).json({ error: 'invalid password' }) }

        //Delete all normal maps of the user
        const normalMapsToDelete = await NormalMap.find({ creator: userToDelete.id })
        for (var i = 0; i < normalMapsToDelete.length; i++) { await expireNormalMap(normalMapsToDelete[i].id, true) }

        //Delete all sessions of the user
        await Session.deleteMany({ userId: userToDelete.id })
        
        //Delete the user
        await User.findByIdAndDelete(userToDelete.id)
        response.status(204).end()
    } catch (exception) {
        next(exception)
    }
})

module.exports = usersRouter