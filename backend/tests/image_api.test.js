const { test, after, beforeEach, describe } = require('node:test')
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
      	passwordHash: null
    },
    {
      	username: 'test2',
      	name: 'Test2 Person2',
      	passwordHash: null
    }
]

let initialImages = [
    {
        file: 'test1',
        format: 'png',
        status: 'pending',
    },
    {
        file: 'test2',
        format: 'png',
        status: 'done',
    }
]

beforeEach(async () => {
    await User.deleteMany({})
    await Image.deleteMany({})
    for (let i = 0; i < initialUsers.length; i++) {
        initialUsers[i].passwordHash = await bcrypt.hash('pass', 10)
        const userObject = new User(initialUsers[i])
        await userObject.save()
        initialUsers[i].token = jwt.sign({ username: userObject.username, id: userObject.id }, process.env.SECRET)
        initialUsers[i].session = new Session({ userId: userObject.id, token: initialUsers[i].token })
        initialUsers[i].session.save()
        initialUsers[i].id = userObject.id
        initialImages[i].creator = userObject.id
        
        const imageObject = new Image(initialImages[i])
        userObject.images = [imageObject.id]
        await imageObject.save()
        await userObject.save()
        initialImages[i].id = imageObject.id
    }
})

describe('image get all metadata', () => {
    test('image metadata request is successfull with correct authorization', async () => {
        await api
            .get('/api/images')
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
    })

    test('image metadata request is rejected with missing authorization', async () => {
        await api
            .get('/api/images')
            .expect(401)
    })

    test('image metadata request is rejected with invalid authorization', async () => {
        await api
            .get('/api/images')
            .set('Authorization', `Bearer invalidtoken`)
            .expect(401)
    })

    test('image metadata is returned as json', async () => {
        await api
            .get('/api/images')
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    

    test('image metadata consists of a non empty list', async () => {
        const result = await api
            .get('/api/images')
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        assert.notEqual(result.body.length, 0)
    })

    test('image metadata contains field "id"', async () => {
        const result = await api
            .get('/api/images')
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        assert(result.body[0].id)
    })

    test('image metadata contains field "file" with the correct value', async () => {
        const result = await api
            .get('/api/images')
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        assert(result.body[0].file)
        assert.equal(result.body[0].file, initialImages[0].file)
    })

    test('image metadata contains field "format" with the correct value', async () => {
        const result = await api
            .get('/api/images')
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        assert(result.body[0].format)
        assert.equal(result.body[0].format, initialImages[0].format)
    })

    test('image metadata contains field "status" with the correct value', async () => {
        const result = await api
            .get('/api/images')
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        assert(result.body[0].status)
        assert.equal(result.body[0].status, initialImages[0].status)
    })

    test('image metadata contains field "creator" and it is populated.', async () => {
        const result = await api
            .get('/api/images')
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        assert(result.body[0].creator)
        assert.equal(result.body[0].creator.id, initialUsers[0].id)
        assert.equal(result.body[0].creator.username, initialUsers[0].username)
        assert.equal(result.body[0].creator.name, initialUsers[0].name)
        assert.equal(result.body[0].creator.images[0], result.body[0].id)
    })
})

describe('image get one metadata', () => {
    test('image metadata request is successfull with correct authorization', async () => {
        await api
            .get(`/api/images/${initialImages[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
    })

    test('image metadata request is rejected with missing authorization', async () => {
        await api
            .get(`/api/images/${initialImages[0].id}`)
            .expect(401)
    })

    test('image metadata request is rejected with invalid authorization', async () => {
        await api
            .get(`/api/images/${initialImages[0].id}`)
            .set('Authorization', `Bearer invalidtoken`)
            .expect(401)
    })

    test('image metadata request is rejected with incorrect authorization', async () => {
        await api
            .get(`/api/images/${initialImages[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .expect(403)
    })

    test('image metadata is returned as json', async () => {
        await api
            .get(`/api/images/${initialImages[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('image metadata contains field "id"', async () => {
        const result = await api
            .get(`/api/images/${initialImages[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        assert(result.body.id)
    })

    test('image metadata contains field "file" with the correct value', async () => {
        const result = await api
            .get(`/api/images/${initialImages[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        assert(result.body.file)
        assert.equal(result.body.file, initialImages[0].file)
    })

    test('image metadata contains field "format" with the correct value', async () => {
        const result = await api
            .get(`/api/images/${initialImages[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        assert(result.body.format)
        assert.equal(result.body.format, initialImages[0].format)
    })

    test('image metadata contains field "status" with the correct value', async () => {
        const result = await api
            .get(`/api/images/${initialImages[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        assert(result.body.status)
        assert.equal(result.body.status, initialImages[0].status)
    })

    test('image metadata contains field "creator" and it is populated.', async () => {
        const result = await api
            .get(`/api/images/${initialImages[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        assert(result.body.creator)
        assert.equal(result.body.creator.id, initialUsers[0].id)
        assert.equal(result.body.creator.username, initialUsers[0].username)
        assert.equal(result.body.creator.name, initialUsers[0].name)
        assert.equal(result.body.creator.images[0], result.body.id)
    })
})

after(async () => {
    await mongoose.connection.close()
    process.exit()
})