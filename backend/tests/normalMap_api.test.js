const { test, after, afterEach, beforeEach, describe, before } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const app = require('../src/app')
const fs = require('fs')
const path = require('path')

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

let initialLayers = [
    {
        file: path.join(process.cwd(), '../output/test2_normal_map.png')
    }
]
let initialFlatImages = [
    {
        file: path.join(process.cwd(), '../output/test2_flat.png')
    }
]
beforeEach(async () => {
    await User.deleteMany({})
    await Session.deleteMany({})
    await NormalMap.deleteMany({})
    await Image.deleteMany({})
    for (let i = 0; i < initialUsers.length; i++) {
        initialUsers[i].passwordHash = await bcrypt.hash('pass', 10)
        const userObject = new User(initialUsers[i])
        await userObject.save()
        initialUsers[i].token = jwt.sign({ username: userObject.username, id: userObject.id }, process.env.SECRET)
        initialUsers[i].session = new Session({ userId: userObject.id, token: initialUsers[i].token })
        initialUsers[i].session.save()
        initialUsers[i].id = userObject.id
        initialNormalMaps[i].creator = userObject.id
        
        if (i === 1) {
            const imageObject = new Image({...initialLayers[0], creator: userObject.id})
            await imageObject.save()
            initialLayers[0].id = imageObject.id
            initialLayers[0].creator = imageObject.creator
            initialNormalMaps[i].layers = [imageObject.id]
        }
        const flatImage = new Image({...initialFlatImages[0], creator: userObject.id})
        await flatImage.save()
        initialNormalMaps[i].flatImage = flatImage.id
        
        const normalMapObject = new NormalMap(initialNormalMaps[i])
        userObject.normalMaps = [normalMapObject.id]
        await normalMapObject.save()
        await userObject.save()
        initialNormalMaps[i].id = normalMapObject.id
    }
})

afterEach(async () => {
    await User.deleteMany({})
    await Session.deleteMany({})
    await NormalMap.deleteMany({})
    

    await Session.deleteMany({ userId: initialUsers[0].id })
    await Session.deleteMany({ userId: initialUsers[1].id })
    for (var i = 0; i < initialUsers.length; i++) {
        const images = await Image.find({ creator: initialUsers[i].id })
        images.forEach(image => {
            if (fs.existsSync(image.file)) {
                fs.unlinkSync(image.file)
            }
        })
    }
    await Image.deleteMany({})
})

after(async () => {
    const output_dir = path.join(process.cwd(), '../output/')
    const files = fs.readdirSync(output_dir)
    files.forEach(file => {
        if (file.includes('test')) {
            fs.unlinkSync(`${output_dir}/${file}`)
        }
    })
    await mongoose.connection.close()
    process.exit()
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

    test('normalmap contains field "creator" which is populated without passwordhash.', async () => {
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
        assert(!result.body[0].creator.passwordHash)
    })

    test('normalmap contains field "layers", which contains initial layers and is id only.', async () => {
        const result = await api
            .get('/api/normalMaps')
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        console.log(result.body)
        assert.equal(result.body.length, 2)

        const returnedMap = result.body.find(normalMap => normalMap.id === initialNormalMaps[1].id)
        assert(returnedMap)
        assert(returnedMap.layers)
        assert.equal(returnedMap.layers.length, 1)
        assert.equal(typeof returnedMap.layers[0], 'string')
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

    test('normal map contains field "creator" and it is populated without passwordhash..', async () => {
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
        assert(!result.body.creator.passwordHash)
    })

    test('normalmap contains field "layers", which contains initial layers and is id only.', async () => {
        const result = await api
            .get(`/api/normalMaps/${initialNormalMaps[1].id}`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        console.log(result.body)
        assert(result.body.layers)
        assert.equal(result.body.layers.length, 1)
        assert.equal(typeof result.body.layers[0], 'string')
    })
})

describe('normal map post', () => {
    const newFile = path.join(process.cwd(), '../output/test3_normal_map.png')
    beforeEach(async () => {
        const img = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA+gAAABkCAYAAAAVORraAAACH0lEQVR42u3XQQ0AAAgEIE1u9LOEmx9oQVcyBQAAALxqQQcAAABBBwAAAAQdAAAABB0AAAAQdAAAABB0AAAAQNABAABA0AEAAABBBwAAAEEHAAAABB0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQAQAAAEEHAAAAQQcAAAAEHQAAAAQdAAAAEHQAAAAQdAAAAEDQAQAAQNABAAAAQQcAAABBBwAAAAQdAAAABB0AAAAQdAAAABB0AAAAQNABAABA0AEAAABBBwAAAEEHAAAABB0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQAQAAAEEHAAAAQQcAAAAEHQAAAAQdAAAAEHQAAAAQdAAAAEDQAQAAQNABAAAAQQcAAABBBwAAAAQdAAAABB0AAAAQdAAAABB0AAAAQNABAABA0AEAAABBBwAAAEEHAAAABB0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQBR0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQAQAAAEEHAAAAQQcAAAAEHQAAAAQdAAAAEHQAAAAQdAAAAEDQAQAAQNABAAAAQQcAAABBBwAAAAQdAAAABB0AAAAQdAAAABB0AAAAQNABAABA0AEAAABBBwAAAEEHAAAABB0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQAQAAAEEHAAAAQQcAAAAEHQAAAAQdAAAAEHQAAAAQdAAAAODCAr+K+TlJsloqAAAAAElFTkSuQmCC"
        const data = img.replace(/^data:image\/\w+;base64,/, "")
        fs.writeFileSync(newFile, Buffer.from(data, 'base64'))
    })
    after(() => {
        fs.unlinkSync(newFile)
    })

    test('normal map post is successfull with valid authorization', async () => {
        await api
            .post(`/api/normalMaps/`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .field('name', 'newNormalMap')
            .expect(201)
    })

    test('layer request is rejected with missing authorization', async () => {
        await api
            .post(`/api/normalMaps/`)
            .field('name', 'newNormalMap')
            .expect(401)
    })

    test('layer request is rejected with invalid authorization', async () => {
        await api
            .post(`/api/normalMaps/`)
            .set('Authorization', `Bearer invalidtoken`)
            .field('name', 'newNormalMap')
            .expect(401)
    })

    test('normal map post requires a name field.', async () => {
        await api
            .post(`/api/normalMaps/`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .expect(400)
    })

    test('a new normal map entry is created with a successful post.', async () => {
        const beforeCount = (await NormalMap.find({})).length
        await api
            .post(`/api/normalMaps/`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .field('name', 'newNormalMap')
            .expect(201)
        const afterCount = (await NormalMap.find({})).length
        assert.equal(afterCount - beforeCount, 1)
    })

    test('the new normal map entry is returned as json on successful post.', async () => {
        await api
            .post(`/api/normalMaps/`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .field('name', 'newNormalMap')
            .expect(201)
            .expect('Content-Type', /application\/json/)
        
    })

    test('the returned normal map entry contains a "name" field with the same value as the submitted name.', async () => {
        const result = await api
            .post(`/api/normalMaps/`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .field('name', 'newNormalMap')
            .expect(201)
            .expect('Content-Type', /application\/json/)
        assert(result.body.name)
        assert.equal(result.body.name, 'newNormalMap')
    })

    test('the returned normal map entry contains a "status" field with value "done"', async () => {
        const result = await api
            .post(`/api/normalMaps/`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .field('name', 'newNormalMap')
            .expect(201)
            .expect('Content-Type', /application\/json/)
        assert(result.body.status)
        assert.equal(result.body.status, "done")
    })

    test('the returned normal map entry contains a "layers" field.', async () => {
        const result = await api
            .post(`/api/normalMaps/`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .field('name', 'newNormalMap')
            .expect(201)
            .expect('Content-Type', /application\/json/)
        assert(result.body.layers)
    })

    test('the returned normal map "layers" field is empty if no image is included.', async () => {
        const result = await api
            .post(`/api/normalMaps/`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .field('name', 'newNormalMap')
            .expect(201)
            .expect('Content-Type', /application\/json/)
        assert.equal(result.body.layers.length, 0)
    })

    test('the returned normal map entry contains a "creator" field.', async () => {
        const result = await api
            .post(`/api/normalMaps/`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .field('name', 'newNormalMap')
            .expect(201)
            .expect('Content-Type', /application\/json/)
        assert(result.body.creator)
    })

    test('normal map post is successful with an image included.', async () => {
        await api
            .post(`/api/normalMaps/`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .attach('files', newFile)
            .field('name', 'newNormalMap')
            .expect(201)
    })

    test('including an image adds to normal map layers', async () => {
        const result = await api
            .post(`/api/normalMaps/`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .attach('files', newFile)
            .field('name', 'newNormalMap')
            .expect(201)
        assert.equal(result.body.layers.length, 1)
    })

    test('normal map layers returned as id only', async () => {
        const result = await api
            .post(`/api/normalMaps/`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .attach('files', newFile)
            .field('name', 'newNormalMap')
            .expect(201)
        assert.equal(typeof result.body.layers[0], 'string')
    })

    test('layers created in image post are added as an image entry', async () => {
        const result = await api
            .post(`/api/normalMaps/`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .attach('files', newFile)
            .field('name', 'newNormalMap')
            .expect(201)
        const imageResult = await Image.findById(result.body.layers[0])
        assert(imageResult)
    })

    test('layer image created in image post exists as a file in the output directory', async () => {
        const result = await api
            .post(`/api/normalMaps/`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .attach('files', newFile)
            .field('name', 'newNormalMap')
            .expect(201)
        const imageResult = await Image.findById(result.body.layers[0])
        assert(fs.existsSync(imageResult.file))
    })
})

describe('layer get one', () => {
    beforeEach(async () => {
        const img = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA+gAAABkCAYAAAAVORraAAACH0lEQVR42u3XQQ0AAAgEIE1u9LOEmx9oQVcyBQAAALxqQQcAAABBBwAAAAQdAAAABB0AAAAQdAAAABB0AAAAQNABAABA0AEAAABBBwAAAEEHAAAABB0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQAQAAAEEHAAAAQQcAAAAEHQAAAAQdAAAAEHQAAAAQdAAAAEDQAQAAQNABAAAAQQcAAABBBwAAAAQdAAAABB0AAAAQdAAAABB0AAAAQNABAABA0AEAAABBBwAAAEEHAAAABB0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQAQAAAEEHAAAAQQcAAAAEHQAAAAQdAAAAEHQAAAAQdAAAAEDQAQAAQNABAAAAQQcAAABBBwAAAAQdAAAABB0AAAAQdAAAABB0AAAAQNABAABA0AEAAABBBwAAAEEHAAAABB0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQBR0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQAQAAAEEHAAAAQQcAAAAEHQAAAAQdAAAAEHQAAAAQdAAAAEDQAQAAQNABAAAAQQcAAABBBwAAAAQdAAAABB0AAAAQdAAAABB0AAAAQNABAABA0AEAAABBBwAAAEEHAAAABB0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQAQAAAEEHAAAAQQcAAAAEHQAAAAQdAAAAEHQAAAAQdAAAAODCAr+K+TlJsloqAAAAAElFTkSuQmCC"
        const data = img.replace(/^data:image\/\w+;base64,/, "")
        fs.writeFileSync(initialLayers[0].file, Buffer.from(data.replace()))
    })

    test('layer request is successfull with correct authorization', async () => {
        await api
            .get(`/api/normalMaps/${initialNormalMaps[1].id}/layers/${initialLayers[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .expect(200)
    })

    test('layer request is rejected with missing authorization', async () => {
        await api
            .get(`/api/normalMaps/${initialNormalMaps[1].id}/layers/${initialLayers[0].id}`)
            .expect(401)
    })

    test('layer request is rejected with invalid authorization', async () => {
        await api
            .get(`/api/normalMaps/${initialNormalMaps[1].id}/layers/${initialLayers[0].id}`)
            .set('Authorization', `Bearer invalidtoken`)
            .expect(401)
    })

    test('layer request is rejected with incorrect authorization', async () => {
        await api
            .get(`/api/normalMaps/${initialNormalMaps[1].id}/layers/${initialLayers[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(403)
    })

    test('layer request returns 404 if layer is not found.', async () => {
        await api
            .get(`/api/normalMaps/${initialNormalMaps[1].id}/layers/aaaaaaaaaaaaaaaaaaaaaaaa`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .expect(404)
    })

    test('layer request returns 404 if normal map is not found.', async () => {
        await api
            .get(`/api/normalMaps/aaaaaaaaaaaaaaaaaaaaaaaa/layers/${initialLayers[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .expect(404)
    })

    test('layer is returned as image/png', async () => {
        await api
            .get(`/api/normalMaps/${initialNormalMaps[1].id}/layers/${initialLayers[0].id}`)
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
    test('layers post is successful with correct authorization', async () => {
        await api
            .post(`/api/normalMaps/${initialNormalMaps[1].id}/layers`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .attach('files', file)
            .expect(201)
    })
    test('layers post is rejected with missing authorization', async () => {
        await api
            .post(`/api/normalMaps/${initialNormalMaps[1].id}/layers`)
            .attach('files', file)
            .expect(401)
    })
    test('layers post is rejected with invalid authorization', async () => {
        await api
            .post(`/api/normalMaps/${initialNormalMaps[1].id}/layers`)
            .set('Authorization', `Bearer invalidtoken`)
            .attach('files', file)
            .expect(401)
    })
    test('layers post is rejected with incorrect authorization', async () => {
        await api
            .post(`/api/normalMaps/${initialNormalMaps[1].id}/layers`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(403)
    })
    test('layers post returns 404 if normal map is not found.', async () => {
        await api
            .post(`/api/normalMaps/aaaaaaaaaaaaaaaaaaaaaaaa/layers`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .expect(404)
    })
    test('layers post requires exactly one layer.', async () => {
        await api
            .post(`/api/normalMaps/${initialNormalMaps[1].id}/layers`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .expect(400)
        await api
            .post(`/api/normalMaps/${initialNormalMaps[1].id}/layers`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .attach('files', file)
            .attach('files', file)
            .expect(400)
    })
    test('sucessful layer post creates a new image entry.', async () => {
        const beforeCount = (await Image.find({})).length
        await api
            .post(`/api/normalMaps/${initialNormalMaps[1].id}/layers`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .attach('files', file)
            .expect(201)
        const afterCount = (await Image.find({})).length
        assert.equal(afterCount - beforeCount, 1)
    })
    test('successful layer post returns normal map object as json.', async () => {
        await api
            .post(`/api/normalMaps/${initialNormalMaps[1].id}/layers`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .attach('files', file)
            .expect(201)
            .expect('Content-Type', /application\/json/)
    })
    test('the returned normal map contains the field "layers"', async () => {
        const result = await api
            .post(`/api/normalMaps/${initialNormalMaps[1].id}/layers`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .attach('files', file)
            .expect(201)
        assert(result.body.layers)
    })
    test('the layers field of the returned normal map contains a new layer.', async () => {
        const result = await api
            .post(`/api/normalMaps/${initialNormalMaps[1].id}/layers`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .attach('files', file)
            .expect(201)
        assert(result.body.layers.length, 1)
    })
    test('layers in the returned normal map are id only', async () => {
        const result = await api
            .post(`/api/normalMaps/${initialNormalMaps[1].id}/layers`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .attach('files', file)
            .expect(201)
        assert.equal(typeof result.body.layers[1], 'string')
    })
    test('the new layer can be fetched with layer get', async () => {
        const result = await api
            .post(`/api/normalMaps/${initialNormalMaps[1].id}/layers`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .attach('files', file)
            .expect(201)
        await api
            .get(`/api/normalMaps/${initialNormalMaps[1].id}/layers/${result.body.layers[1]}`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .expect(200)
            .expect('Content-Type', /image\/png/)
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

    test('normal map delete removes flat image from database', async () => {
        await api
            .delete(`/api/normalMaps/${initialNormalMaps[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(204)
            const result = await Image.findById(initialNormalMaps[0].flatImage)
            assert(!result)
    })

    test('normal map delete removes all layer image files', async () => {
        const buffer = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAA+gAAABkCAYAAAAVORraAAACH0lEQVR42u3XQQ0AAAgEIE1u9LOEmx9oQVcyBQAAALxqQQcAAABBBwAAAAQdAAAABB0AAAAQdAAAABB0AAAAQNABAABA0AEAAABBBwAAAEEHAAAABB0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQAQAAAEEHAAAAQQcAAAAEHQAAAAQdAAAAEHQAAAAQdAAAAEDQAQAAQNABAAAAQQcAAABBBwAAAAQdAAAABB0AAAAQdAAAABB0AAAAQNABAABA0AEAAABBBwAAAEEHAAAABB0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQAQAAAEEHAAAAQQcAAAAEHQAAAAQdAAAAEHQAAAAQdAAAAEDQAQAAQNABAAAAQQcAAABBBwAAAAQdAAAABB0AAAAQdAAAABB0AAAAQNABAABA0AEAAABBBwAAAEEHAAAABB0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQBR0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQAQAAAEEHAAAAQQcAAAAEHQAAAAQdAAAAEHQAAAAQdAAAAEDQAQAAQNABAAAAQQcAAABBBwAAAAQdAAAABB0AAAAQdAAAABB0AAAAQNABAABA0AEAAABBBwAAAEEHAAAABB0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQAQAAAEEHAAAAQQcAAAAEHQAAAAQdAAAAEHQAAAAQdAAAAODCAr+K+TlJsloqAAAAAElFTkSuQmCC',
            'base64'
        )
        fs.writeFileSync(initialLayers[0].file, buffer)
        await api
            .delete(`/api/normalMaps/${initialNormalMaps[1].id}`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .expect(204)

            assert(!fs.existsSync(initialLayers[0].file))
    })

    test('normal map delete removes flat image file', async () => {
        const buffer = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAA+gAAABkCAYAAAAVORraAAACH0lEQVR42u3XQQ0AAAgEIE1u9LOEmx9oQVcyBQAAALxqQQcAAABBBwAAAAQdAAAABB0AAAAQdAAAABB0AAAAQNABAABA0AEAAABBBwAAAEEHAAAABB0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQAQAAAEEHAAAAQQcAAAAEHQAAAAQdAAAAEHQAAAAQdAAAAEDQAQAAQNABAAAAQQcAAABBBwAAAAQdAAAABB0AAAAQdAAAABB0AAAAQNABAABA0AEAAABBBwAAAEEHAAAABB0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQAQAAAEEHAAAAQQcAAAAEHQAAAAQdAAAAEHQAAAAQdAAAAEDQAQAAQNABAAAAQQcAAABBBwAAAAQdAAAABB0AAAAQdAAAABB0AAAAQNABAABA0AEAAABBBwAAAEEHAAAABB0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQBR0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQAQAAAEEHAAAAQQcAAAAEHQAAAAQdAAAAEHQAAAAQdAAAAEDQAQAAQNABAAAAQQcAAABBBwAAAAQdAAAABB0AAAAQdAAAABB0AAAAQNABAABA0AEAAABBBwAAAEEHAAAABB0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQAQAAAEEHAAAAQQcAAAAEHQAAAAQdAAAAEHQAAAAQdAAAAODCAr+K+TlJsloqAAAAAElFTkSuQmCC',
            'base64'
        )
        fs.writeFileSync(initialFlatImages[0].file, buffer)
        await api
            .delete(`/api/normalMaps/${initialNormalMaps[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(204)

            assert(!fs.existsSync(initialFlatImages[0].file))
           
    })

    test('normal map delete removes normal map reference from the related user.', async () => {
        await api
            .delete(`/api/normalMaps/${initialNormalMaps[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(204)

            const result = await User.findById(initialNormalMaps[0].creator)
            assert(!result.normalMaps.map(id => id.toString()).includes(initialNormalMaps[0].id.toString()))
    })
})

describe('normal map put', () => {
    const buffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAA+gAAABkCAYAAAAVORraAAACH0lEQVR42u3XQQ0AAAgEIE1u9LOEmx9oQVcyBQAAALxqQQcAAABBBwAAAAQdAAAABB0AAAAQdAAAABB0AAAAQNABAABA0AEAAABBBwAAAEEHAAAABB0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQAQAAAEEHAAAAQQcAAAAEHQAAAAQdAAAAEHQAAAAQdAAAAEDQAQAAQNABAAAAQQcAAABBBwAAAAQdAAAABB0AAAAQdAAAABB0AAAAQNABAABA0AEAAABBBwAAAEEHAAAABB0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQAQAAAEEHAAAAQQcAAAAEHQAAAAQdAAAAEHQAAAAQdAAAAEDQAQAAQNABAAAAQQcAAABBBwAAAAQdAAAABB0AAAAQdAAAABB0AAAAQNABAABA0AEAAABBBwAAAEEHAAAABB0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQBR0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQAQAAAEEHAAAAQQcAAAAEHQAAAAQdAAAAEHQAAAAQdAAAAEDQAQAAQNABAAAAQQcAAABBBwAAAAQdAAAABB0AAAAQdAAAABB0AAAAQNABAABA0AEAAABBBwAAAEEHAAAABB0AAAAEHQAAABB0AAAAEHQAAABA0AEAAEDQAQAAAEEHAAAAQQcAAAAEHQAAAAQdAAAAEHQAAAAQdAAAAODCAr+K+TlJsloqAAAAAElFTkSuQmCC',
        'base64'
    )
    const testlayer = path.join(process.cwd(), 'tests/testlayer.png')
    fs.writeFileSync(testlayer, buffer)

    after(() => {
        fs.unlinkSync(testlayer)
    })
    test('normal map put is successful with correct authorization', async () => {
        await api
            .put(`/api/normalMaps/${initialNormalMaps[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(201)
    })
    test('normal map put is rejected with missing authorization', async () => {
        await api
            .put(`/api/normalMaps/${initialNormalMaps[0].id}`)
            .expect(401)
    })
    test('normal map put is rejected with invalid authorization', async () => {
        await api
            .put(`/api/normalMaps/${initialNormalMaps[0].id}`)
            .set('Authorization', `Bearer invalidtoken`)
            .expect(401)
    })
    test('normal map put is rejected with incorrect authorization', async () => {
        await api
            .put(`/api/normalMaps/${initialNormalMaps[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[1].token}`)
            .expect(403)
    })
    test('layer included in normal map are appended to the returned object', async () => {
        const response = await api
            .put(`/api/normalMaps/${initialNormalMaps[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .attach('files', testlayer)
            .expect(201)
        assert(response.body.layers)
        assert.equal(response.body.layers.length, 1)
    })
    test('layer included in normal map are id only', async () => {
        const response = await api
            .put(`/api/normalMaps/${initialNormalMaps[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .attach('files', testlayer)
            .expect(201)
        assert.equal(typeof response.body.layers[0], 'string')
    })
    test('new layer can be fetched with layer get', async () => {
        const response = await api
            .put(`/api/normalMaps/${initialNormalMaps[0].id}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .attach('files', testlayer)
            .expect(201)
        console.log(response.body)
        await api
            .get(`/api/normalMaps/${initialNormalMaps[1].id}/layers/${response.body.layers[0]}`)
            .set('Authorization', `Bearer ${initialUsers[0].token}`)
            .expect(200)
            .expect('Content-Type', /image\/png/)
    })
})
