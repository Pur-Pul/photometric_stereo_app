const { test, after, afterEach, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const app = require('../src/app')

const api = supertest(app)
const User = require('../src/models/user')
const Image = require('../src/models/image')
const Session = require('../src/models/session')

let initialUsers = [
    {
      	username: 'test1',
      	name: 'Test1 Person1',
      	passwordHash: null,
        role: 'user'
    },
    {
      	username: 'admin',
      	name: 'Test2 Person2',
      	passwordHash: null,
        role: 'admin'
    }
]

beforeEach(async () => {
    await User.deleteMany({ username: 'test1' })
    await User.deleteMany({ username: 'admin' })
    for (let i = 0; i < initialUsers.length; i++) {
        initialUsers[i].passwordHash = await bcrypt.hash('pass', 10)
        let userObject = new User(initialUsers[i])
        await userObject.save()
        initialUsers[i].id = userObject.id
        initialUsers[i].token = jwt.sign({ username: userObject.username, id: userObject.id }, process.env.SECRET)
        initialUsers[i].session = new Session({ userId: userObject.id, token: initialUsers[i].token })
        initialUsers[i].session.save()
    }
})

afterEach(async () => {
    for (var i = 0; i < initialUsers.length; i++) {
        await User.findByIdAndDelete(initialUsers[i].id)
        await Session.findByIdAndDelete(initialUsers[i].session.id)
    }
})

describe('user get', () => {
    test('users are returned as json', async () => {
        await api
            .get('/api/users')
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })
    test(`there are ${initialUsers.length} users`, async () => {
        const response = await api
            .get('/api/users')
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
        assert.strictEqual(response.body.length, initialUsers.length)
    })

    test('User contains \'id\'.', async () => {
        const response = await api
            .get('/api/users')
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
        assert('id' in response.body[0])
    })

    test('User does not contain \'_id\'.', async () => {
        const response = await api
            .get('/api/users')
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
        assert(!('_id' in response.body[0]))
    })

    test('User object does not contain \'password.\'', async () => {
        const response = await api
            .get('/api/users')
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
        assert(!('passwordHash' in response.body[0]))
    })

    test('User object contains normalMaps field.', async () => {
        const response = await api
            .get('/api/users')
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
        assert('normalMaps' in response.body[0])
    })

    test('User object contains \'name\' field only if authorized as the requested user.', async () => {
        const response = await api
            .get('/api/users')
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
        
        response.body.forEach(user => {
            if (user.id === initialUsers[1].id) {
                assert('name' in user)
            } else {
                assert(!('name' in user))
            }
        })        
    })
})

describe('user post', () => {
    beforeEach(async () => {
        await User.findOneAndDelete({ username: 'newuser' })
    })
    afterEach(async() => {
        await User.findOneAndDelete({ username: 'newuser' })
    })
    test('New user can be created.', async () => {
        
        let newUser = {
            username: 'newuser',
            name: 'new user',
            password: 'sekret'
        }

        const response = await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const user = await User.findById(response.body.id)
        assert(user)
        assert.equal(user.username, 'newuser')
        assert.equal(user.name, 'new user')
    })

    test('New users are of "user" role by default.', async () => {
        
        let newUser = {
            username: 'newuser',
            name: 'new user',
            password: 'sekret'
        }

        const response = await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const user = await User.findById(response.body.id)
        assert.equal(user.role, 'user')
    })

    test('username is required', async () => {
        let newUser = {
            name: 'new user',
            password: 'sekret'
        }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
    })

    test('username has to be atleast 3 characters long', async () => {
        let newUser = {
            username: 'ne',
            name: 'new user',
            password: 'sekret'
        }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
    })

    test('username has to be unique', async () => {
        let newUser = {
            username: 'test1',
            name: 'new user',
            password: 'sekret'
        }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
    })

    test('password is required', async () => {
        let newUser = {
            username: 'newuser',
            name: 'new user'
        }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
    })

    test('password has to be atleast 3 characters long', async () => {
        let newUser = {
            username: 'newuser',
            name: 'new user',
            password: 'se'
        }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
    })
})

after(async () => {
    await mongoose.connection.close()
    process.exit()
})