const { test, after, afterEach, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const app = require('../src/app')
const fs = require('fs')
const path = require('path')
const FormData = require('form-data')

const api = supertest(app)
const User = require('../src/models/user')
const Image = require('../src/models/image')
const NormalMap = require('../src/models/normalMap')
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

let initialNormalMaps = [
    {
        name: 'test1',
        status: 'pending',
        layers: []
    },
    {
        name: 'test2',
        status: 'done',
        layers: []
    }
]

let initialImages = [
    {
        file: path.join(process.cwd(), '../output/test2_normal_map.png'),
        format: "png"
    }
]

beforeEach(async () => {
    await User.deleteMany({})
    await Image.deleteMany({})
    await NormalMap.deleteMany({})
   

    for (let i = 0; i < initialUsers.length; i++) {
        initialUsers[i].passwordHash = await bcrypt.hash('pass', 10)
        const userObject = new User(initialUsers[i])
        await userObject.save()
        initialUsers[i].token = jwt.sign({ username: userObject.username, id: userObject.id }, process.env.SECRET)
        initialUsers[i].session = new Session({ userId: userObject.id, token: initialUsers[i].token })
        initialUsers[i].session.save()
        initialUsers[i].id = userObject.id
        initialNormalMaps[i].creator = userObject.id
        
        if (i == 1) {
            const imageObject = new Image({...initialImages[0], creator: userObject.id})
            await imageObject.save()
            initialImages[0].id = imageObject.id
            initialImages[0].creator = imageObject.creator
            initialNormalMaps[1].images = [imageObject.id]
        }

        const normalMapObject = new NormalMap(initialNormalMaps[i])
        userObject.normalMaps = [normalMapObject.id]
        await normalMapObject.save()
        await userObject.save()
        initialNormalMaps[i].id = normalMapObject.id
    }

})

afterEach(async () => {
    await Session.deleteMany({ userId: initialUsers[0].id })
    await Session.deleteMany({ userId: initialUsers[1].id })
})

describe('normalmap get all', () => {
    test('normalmap get all request is successfull with correct authorization', async () => {
        await api
            .get('/api/normalMaps')
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
    })

    test('normalmap get all request is rejected with missing authorization', async () => {
        await api
            .get('/api/normalMaps')
            .expect(401)
    })

    test('normalmap get all request is rejected with invalid authorization', async () => {
        await api
            .get('/api/normalMaps')
            .set('Authorization', `Bearer invalidtoken`)
            .expect(401)
    })

    test('normalmaps are returned as json', async () => {
        await api
            .get('/api/normalMaps')
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('normalmap get all response consists of a non empty list', async () => {
        const result = await api
            .get('/api/normalMaps')
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        assert.notEqual(result.body.length, 0)
    })

    test('normalmap contains field "id"', async () => {
        const result = await api
            .get('/api/normalMaps')
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        assert(result.body[0].id)
    })

    test('normalmap contains field "name" with the correct value', async () => {
        const result = await api
            .get('/api/normalMaps')
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        assert(result.body[0].name)
        assert.equal(result.body[0].name, initialNormalMaps[0].name)
    })

    test('normalmap contains field "status" with the correct value', async () => {
        const result = await api
            .get('/api/normalMaps')
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        assert(result.body[0].status)
        assert.equal(result.body[0].status, initialNormalMaps[0].status)
    })

    test('normalmap contains field "creator" and it is populated.', async () => {
        const result = await api
            .get('/api/normalMaps')
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        assert(result.body[0].creator)
        assert.equal(result.body[0].creator.id, initialUsers[0].id)
        assert.equal(result.body[0].creator.username, initialUsers[0].username)
        assert.equal(result.body[0].creator.name, initialUsers[0].name)
        assert.equal(result.body[0].creator.normalMaps[0], result.body[0].id)
    })
})

describe('normal map get one', () => {
    test('normal map request is successfull with correct authorization', async () => {
        await api
            .get(`/api/normalMaps/${initialNormalMaps[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
    })

    test('normal map request is rejected with missing authorization', async () => {
        await api
            .get(`/api/normalMaps/${initialNormalMaps[0].id}`)
            .expect(401)
    })

    test('normal map request is rejected with invalid authorization', async () => {
        await api
            .get(`/api/normalMaps/${initialNormalMaps[0].id}`)
            .set('Authorization', `Bearer invalidtoken`)
            .expect(401)
    })

    test('normal map request is rejected with incorrect authorization', async () => {
        await api
            .get(`/api/normalMaps/${initialNormalMaps[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .expect(403)
    })

    test('normal map request returns 404 if not found.', async () => {
        await api
            .get(`/api/normalMaps/aaaaaaaaaaaaaaaaaaaaaaaa`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(404)
    })

    test('normal map is returned as json', async () => {
        await api
            .get(`/api/normalMaps/${initialNormalMaps[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('normal map contains field "id"', async () => {
        const result = await api
            .get(`/api/normalMaps/${initialNormalMaps[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        assert(result.body.id)
    })

    test('normal map contains field "name" with the correct value', async () => {
        const result = await api
            .get(`/api/normalMaps/${initialNormalMaps[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        assert(result.body.name)
        assert.equal(result.body.name, initialNormalMaps[0].name)
    })

    test('normal map contains field "status" with the correct value', async () => {
        const result = await api
            .get(`/api/normalMaps/${initialNormalMaps[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        assert(result.body.status)
        assert.equal(result.body.status, initialNormalMaps[0].status)
    })

    test('normal map contains field "creator" and it is populated.', async () => {
        const result = await api
            .get(`/api/normalMaps/${initialNormalMaps[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        assert(result.body.creator)
        assert.equal(result.body.creator.id, initialUsers[0].id)
        assert.equal(result.body.creator.username, initialUsers[0].username)
        assert.equal(result.body.creator.name, initialUsers[0].name)
        assert.equal(result.body.creator.normalMaps[0], result.body.id)
    })
})

describe('layer get one', () => {
    beforeEach(async () => {
        const img = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA+gAAABkCAYAAAAVORraAAACH0lEQVR42u3XQQ0AAAgEIE1u9LOEmx9oQVcyBQAAALxqQQcAAABBBwAAAAQdAAAABB0AAAAQdAAAABB0AAAAQNABAABA0AEAAABBBwAAAEEHAAAABB0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQAQAAAEEHAAAAQQcAAAAEHQAAAAQdAAAAEHQAAAAQdAAAAEDQAQAAQNABAAAAQQcAAABBBwAAAAQdAAAABB0AAAAQdAAAABB0AAAAQNABAABA0AEAAABBBwAAAEEHAAAABB0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQAQAAAEEHAAAAQQcAAAAEHQAAAAQdAAAAEHQAAAAQdAAAAEDQAQAAQNABAAAAQQcAAABBBwAAAAQdAAAABB0AAAAQdAAAABB0AAAAQNABAABA0AEAAABBBwAAAEEHAAAABB0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQBR0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQAQAAAEEHAAAAQQcAAAAEHQAAAAQdAAAAEHQAAAAQdAAAAEDQAQAAQNABAAAAQQcAAABBBwAAAAQdAAAABB0AAAAQdAAAABB0AAAAQNABAABA0AEAAABBBwAAAEEHAAAABB0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQAQAAAEEHAAAAQQcAAAAEHQAAAAQdAAAAEHQAAAAQdAAAAODCAr+K+TlJsloqAAAAAElFTkSuQmCC"
        const data = img.replace(/^data:image\/\w+;base64,/, "")
        fs.writeFileSync(initialImages[0].file, Buffer.from(data.replace()))
    })
    after(() => {
        fs.unlinkSync(initialImages[0].file)
    })

    test('layer request is successfull with correct authorization', async () => {
        await api
            .get(`/api/normalMaps/layers/${initialImages[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .expect(200)
    })

    test('layer request is rejected with missing authorization', async () => {
        await api
            .get(`/api/normalMaps/layers/${initialImages[0].id}`)
            .expect(401)
    })

    test('layer request is rejected with invalid authorization', async () => {
        await api
            .get(`/api/normalMaps/layers/${initialImages[0].id}`)
            .set('Authorization', `Bearer invalidtoken`)
            .expect(401)
    })

    test('layer request is rejected with incorrect authorization', async () => {
        await api
            .get(`/api/normalMaps/layers/${initialImages[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(403)
    })

    test('layer request returns 404 if not found.', async () => {
        await api
            .get(`/api/normalMaps/layers/aaaaaaaaaaaaaaaaaaaaaaaa`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .expect(404)
    })

    test('layer is returned as image/png', async () => {
        await api
            .get(`/api/normalMaps/layers/${initialImages[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .expect(200)
            .expect('Content-Type', /image\/png/)
    })

    
})

describe('layer post one', () => {
    const buffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAA+gAAABkCAYAAAAVORraAAACH0lEQVR42u3XQQ0AAAgEIE1u9LOEmx9oQVcyBQAAALxqQQcAAABBBwAAAAQdAAAABB0AAAAQdAAAABB0AAAAQNABAABA0AEAAABBBwAAAEEHAAAABB0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQAQAAAEEHAAAAQQcAAAAEHQAAAAQdAAAAEHQAAAAQdAAAAEDQAQAAQNABAAAAQQcAAABBBwAAAAQdAAAABB0AAAAQdAAAABB0AAAAQNABAABA0AEAAABBBwAAAEEHAAAABB0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQAQAAAEEHAAAAQQcAAAAEHQAAAAQdAAAAEHQAAAAQdAAAAEDQAQAAQNABAAAAQQcAAABBBwAAAAQdAAAABB0AAAAQdAAAABB0AAAAQNABAABA0AEAAABBBwAAAEEHAAAABB0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQBR0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQAQAAAEEHAAAAQQcAAAAEHQAAAAQdAAAAEHQAAAAQdAAAAEDQAQAAQNABAAAAQQcAAABBBwAAAAQdAAAABB0AAAAQdAAAABB0AAAAQNABAABA0AEAAABBBwAAAEEHAAAABB0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQAQAAAEEHAAAAQQcAAAAEHQAAAAQdAAAAEHQAAAAQdAAAAODCAr+K+TlJsloqAAAAAElFTkSuQmCC',
        'base64'
    )
    const file = path.join(process.cwd(), 'tests/test3.png')
    fs.writeFileSync(file, buffer)
    after(() => {
        fs.unlinkSync(file)
    })
    test('image post is successful with valid authorization', async () => {
        await api
            .post('/api/normalMaps')
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .attach('files', file)
            .expect(201)
    })
    test('image post is rejected with missing authorization', async () => {
        await api
            .post(`/api/normalMaps`)
            .attach('files', file)
            .expect(401)
    })
    test('image post is rejected with invalid authorization', async () => {
        await api
            .post(`/api/normalMaps`)
            .set('Authorization', `Bearer invalidtoken`)
            .attach('files', file)
            .expect(401)
    })
    test('image post requires exactly one layer.', async () => {
        await api
            .post('/api/normalMaps')
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .expect(400)
        await api
            .post('/api/normalMaps')
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .attach('files', file)
            .attach('files', file)
            .expect(400)
    })
})

describe('normal map delete', () => {
    test('normal map delete is successfull with correct authorization', async () => {
        await api
            .delete(`/api/normalMaps/${initialNormalMaps[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(204)
    })

    test('normal map delete is rejected with missing authorization', async () => {
        await api
            .delete(`/api/normalMaps/${initialNormalMaps[0].id}`)
            .expect(401)
    })

    test('normal map delete is rejected with invalid authorization', async () => {
        await api
            .delete(`/api/normalMaps/${initialNormalMaps[0].id}`)
            .set('Authorization', `Bearer invalidtoken`)
            .expect(401)
    })

    test('normal map delete is rejected with incorrect authorization', async () => {
        await api
            .delete(`/api/normalMaps/${initialNormalMaps[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .expect(403)
    })

    test('normal map request returns 404 if not found.', async () => {
        await api
            .delete(`/api/normalMaps/aaaaaaaaaaaaaaaaaaaaaaaa`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(404)
    })

    test('normal map delete removes normal map from database', async () => {
        await api
            .delete(`/api/normalMaps/${initialNormalMaps[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(204)
        
            const result = await NormalMap.findById(initialNormalMaps[0].id)
            assert(!result)
    })

    test('normal map delete removes all layers from database', async () => {
        await api
            .delete(`/api/normalMaps/${initialNormalMaps[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(204)

            for (var i=0; i < initialNormalMaps[0].layers.length; i++) {
                const result = await Image.findById(initialNormalMaps[0].layers[i])
                assert(!result)
            }
           
    })

    test('normal map deletes all layer image files', async () => {
        await api
            .delete(`/api/normalMaps/${initialNormalMaps[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(204)

            assert(!fs.existsSync(initialImages[0].file))
           
    })
})

after(async () => {
    await mongoose.connection.close()
    process.exit()
})