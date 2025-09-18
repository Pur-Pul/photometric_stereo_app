const { test, after, afterEach, beforeEach, describe, before } = require('node:test')
const mongoose = require('mongoose')
const assert = require('node:assert')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../src/app')
const jwt = require('jsonwebtoken')

const api = supertest(app)
const User = require('../src/models/user')
const Image = require('../src/models/image')
const Session = require('../src/models/session')

let initialUsers = [
    {
        username: 'test1',
        email: 'test1@test.com',
        name: 'Test1 Person1',
        passwordHash: null,
        verified: true
    },
    {
        username: 'test2',
        email: 'test2@test.com',
        name: 'Test2 Person2',
        passwordHash: null,
        verified: true
    }
]

before(async () => {
    mongoose
        .connect(config.MONGODB_URI)
        .then(() => {
            logger.info('connected to MongoDB')
        })
        .catch((error) => {
            logger.error('error connecting to MongoDB:', error.message)
        })
})


after(async () => {
    await mongoose.connection.close()
    process.exit(0)
})

beforeEach(async () => {
    await User.deleteMany({})
    await Session.deleteMany({})
    for (let i = 0; i < initialUsers.length; i++) {
        initialUsers[i].passwordHash = await bcrypt.hash('pass', 10)
        let userObject = new User(initialUsers[i])
        await userObject.save()
        initialUsers[i].token = jwt.sign({ username: userObject.username, id: userObject.id }, process.env.SECRET)
        initialUsers[i].session = new Session({ userId: userObject.id, token: initialUsers[i].token })
        initialUsers[i].id = userObject.id
        await initialUsers[i].session.save()
    }
})
afterEach(async () => {
    await User.deleteMany({})
    await Session.deleteMany({})
})

describe('logout delete', () => {
    test('logout request succeeds with valid token.', async () => {
        await api
            .delete('/api/logout')
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(204)
    })
    test('Successful logout request deletes session bound to the token.', async () => {
        await api
            .delete('/api/logout')
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(204)
        const result = await Session.findById(initialUsers[0].session.id)
        assert.equal(result, undefined)
    })
    test('Successful logout request does not delete any unrelated session.', async () => {
        await api
            .delete('/api/logout')
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(204)
        const result = await Session.findById(initialUsers[1].session.id)
        assert(result)
    })
    test('Successful logout request deletes all sessions for the related user.', async () => {
        
        let second_token = undefined
        while (second_token == undefined || second_token == initialUsers[0].token) {
            second_token = jwt.sign({ username: initialUsers[0].username, id: initialUsers[0].id }, process.env.SECRET)
        }
        
        const second_session = new Session({ userId: initialUsers[0].id, token: second_token })
        await second_session.save()
        await api
            .delete('/api/logout')
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(204)
        const first_result = await Session.findById(initialUsers[0].session.id)
        const second_result = await Session.findById(second_session.id)
        assert.equal(first_result, undefined)
        assert.equal(second_result, undefined)
    })
})
