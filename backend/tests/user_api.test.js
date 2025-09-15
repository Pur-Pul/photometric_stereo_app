const { test, after, afterEach, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const app = require('../src/app')

const api = supertest(app)
const User = require('../src/models/user')
const NormalMap = require('../src/models/normalMap')
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
      	username: 'testadmin',
        email: 'testadmin@test.com',
      	name: 'admin',
      	passwordHash: null,
        role: 'admin',
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

beforeEach(async () => {
    await User.deleteMany({})
    await Session.deleteMany({})
    for (let i = 0; i < initialUsers.length; i++) {
        initialUsers[i].passwordHash = await bcrypt.hash('pass', 10)
        let userObject = new User(initialUsers[i])
        await userObject.save()
        initialUsers[i].id = userObject.id
        initialUsers[i].token = jwt.sign({ username: userObject.username, id: userObject.id }, process.env.SECRET)
        initialUsers[i].session = new Session({ userId: userObject.id, token: initialUsers[i].token })
        initialUsers[i].session.save()
        initialUsers[i].updatedAt = userObject.updatedAt.toString()
    }
})

afterEach(async () => {
    await User.deleteMany({})
    await Session.deleteMany({})
})

after(async () => {
    await mongoose.connection.close()
    process.exit()
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
            email: 'newuser@test.com',
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
            email: 'newuser@test.com',
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
            email: 'newuser@test.com',
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
            email: 'newuser@test.com',
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
            email: 'newuser@test.com',
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
            email: 'newuser@test.com',
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
            email: 'newuser@test.com',
            name: 'new user',
            password: 'se'
        }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
    })
})

describe('user delete', () => {
    
    beforeEach(async () => {
        await NormalMap.deleteMany({})
        const user1 = await User.findById(initialUsers[0].id)
        const user2 = await User.findById(initialUsers[2].id)
        const normalMap = new NormalMap({
            name: 'test map',
            status: 'done',
            creator: user1.id
        })
        normalMap.save()
        user1.normalMaps = [normalMap.id]
        await user1.save()
        user2.normalMaps = [normalMap.id]
        await user2.save()
    })
    afterEach(async() => {
        await NormalMap.deleteMany({})
    })
    test('User can delete self.', async () => {
        await api
            .delete(`/api/users/${initialUsers[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(204)

        const user = await User.findById(initialUsers[0].id)
        assert(!user)
    })
    test('User can not delete another user.', async () => {
        await api
            .delete(`/api/users/${initialUsers[2].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(403)

        const user = await User.findById(initialUsers[2].id)
        assert(user)
    })
    test('Admin can delete another user.', async () => {
        await api
            .delete(`/api/users/${initialUsers[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .expect(204)

        const user = await User.findById(initialUsers[0].id)
        assert(!user)
    })
    test('A successful delete also deletes all realted sessions.', async () => {
        await api
            .delete(`/api/users/${initialUsers[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(204)

        const sessions = await Session.find({userId: initialUsers[0].id})
        assert.equal(sessions.length, 0)
    })
    test('A successful delete also deletes all normalmaps that the deleted user is listed as creator for.', async () => {
        await api
            .delete(`/api/users/${initialUsers[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(204)

        const normalmaps = await NormalMap.find({creator: initialUsers[0].id})
        assert.equal(normalmaps.length, 0)
    })
    test('A successful delete does not delete normalmaps that the deleted user has access to, but is not creator of.', async () => {
        await api
            .delete(`/api/users/${initialUsers[2].id}`)
            .set('Authorization', `Bearer ${initialUsers[2].token}`)
            .expect(204)

        const normalmaps = await NormalMap.find({ creator: initialUsers[0].id })
        assert.equal(normalmaps.length, 1)
    })
    test('An unsuccessful delete does not delete related normalmaps or sessions.', async () => {
        await api
            .delete(`/api/users/${initialUsers[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[2].token}`)
            .expect(403)

        const normalmaps = await NormalMap.find({ creator: initialUsers[0].id })
        assert.equal(normalmaps.length, 1)
        assert.equal(normalmaps[0].name, 'test map')

        const sessions = await Session.find({ userId: initialUsers[0].id} )
        assert.equal(sessions.length, 1)
    })
})

describe('user put', () => {
    test('user can make a PUT request to their own account.', async () => {

        await api
            .put(`/api/users/${initialUsers[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const user = await User.findById(initialUsers[0].id)
        assert(user)
        assert.equal(user.username, 'test1')
        assert.equal(user.name, 'Test1 Person1')
    })
    test('user can not make a PUT request to another account', async () => {
        await api
            .put(`/api/users/${initialUsers[2].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(403)

        const user = await User.findById(initialUsers[2].id)
        assert(user)
        assert.equal(user.username, 'test2')
        assert.equal(user.name, 'Test2 Person2')
    })
    test('admin can make a PUT request to another account', async () => {
        await api
            .put(`/api/users/${initialUsers[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const user = await User.findById(initialUsers[0].id)
        assert(user)
        assert.equal(user.username, 'test1')
        assert.equal(user.name, 'Test1 Person1')
    })
    test('successful put request updates username', async () => {
        let newUser = {
            username: 'updateduser',
            //name: 'updated user',
            //password: '',
        }
        await api
            .put(`/api/users/${initialUsers[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const user = await User.findById(initialUsers[0].id)
        assert(user)
        assert.equal(user.username, 'updateduser')
        assert.equal(user.name, 'Test1 Person1')
        assert.equal(user.role, 'user')
    })
    test('successful put request updates name', async () => {
        let newUser = {
            //username: 'updateduser',
            name: 'updated user',
            //password: '',
        }
        await api
            .put(`/api/users/${initialUsers[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const user = await User.findById(initialUsers[0].id)
        assert(user)
        assert.equal(user.username, 'test1')
        assert.equal(user.name, 'updated user')
        assert.equal(user.role, 'user')
    })
    test('successful put request updates role if requester is admin.', async () => {
        let newUser = {
            //username: 'updateduser',
            //name: 'updated user',
            role: 'admin',
            //password: '',
        }
        await api
            .put(`/api/users/${initialUsers[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const user = await User.findById(initialUsers[0].id)
        assert(user)
        assert.equal(user.username, 'test1')
        assert.equal(user.name, 'Test1 Person1')
        assert.equal(user.role, 'admin')
    })
    test('successful put request does not update role if requester is not admin.', async () => {
        let newUser = {
            //username: 'updateduser',
            //name: 'updated user',
            role: 'admin',
            //password: '',
        }
        await api
            .put(`/api/users/${initialUsers[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const user = await User.findById(initialUsers[0].id)
        assert(user)
        assert.equal(user.username, 'test1')
        assert.equal(user.name, 'Test1 Person1')
        assert.equal(user.role, 'user')
    })
    test('successful put request updates password', async () => {
        let newUser = {
            //username: 'updateduser',
            //name: 'updated user',
            //role: 'admin',
            password: 'newpass',
        }
        await api
            .put(`/api/users/${initialUsers[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const user = await User.findById(initialUsers[0].id)
        const passwordCorrect = await bcrypt.compare('newpass', user.passwordHash)
        assert(user)
        assert.equal(user.username, 'test1')
        assert.equal(user.name, 'Test1 Person1')
        assert.equal(user.role, 'user')
        assert(passwordCorrect)
    })
    test('sucessful put requests updates multiple included elements.', async () => {
        let newUser = {
            username: 'updateduser',
            name: 'updated user',
            role: 'admin',
            password: 'newpass',
        }
        await api
            .put(`/api/users/${initialUsers[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const user = await User.findById(initialUsers[0].id)
        const passwordCorrect = await bcrypt.compare('newpass', user.passwordHash)
        assert(user)
        assert.equal(user.username, 'updateduser')
        assert.equal(user.name, 'updated user')
        assert.equal(user.role, 'admin')
        assert(passwordCorrect)
    })
    test('sucessful put requests do not update the id', async () => {
        let newUser = {
            id: 'test'
        }
        await api
            .put(`/api/users/${initialUsers[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const user = await User.findById(initialUsers[0].id)
        assert(user)
        assert.equal(user.username, 'test1')
        assert.equal(user.name, 'Test1 Person1')
        assert.equal(user.role, 'user')
    })
})