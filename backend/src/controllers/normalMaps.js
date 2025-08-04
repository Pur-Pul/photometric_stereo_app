const normalMapsRouter = require('express').Router()
const Image = require('../models/image')
const NormalMap = require('../models/normalMap')
const middleware = require('../utils/middleware')
const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const { PHOTOSTEREO_URI } = require('../utils/config')
const { ValidationError } = require('../utils/errors')
const logger = require('../utils/logger')
const { expireNormalMap } = require('../utils/expiration_manager')

normalMapsRouter.get('/', middleware.userExtractor, async (request, response) => {
    const user = request.user
    if (user) {
        const normalMaps = await NormalMap.find({ creator: user }).populate('creator').populate('layers')
        response.json(normalMaps)
    }
})

normalMapsRouter.get('/:id', middleware.userExtractor, async (request, response) => {
    const id = request.params.id
    const user = request.user
    const normalMap = await NormalMap.findById(id).populate('creator').populate('layers')
    if (!normalMap) { return response.status(404).end() }
    if (user.id !== normalMap.creator.id) { return response.status(403).json({ error: 'incorrect user' }) }

    response.json(normalMap)
})

normalMapsRouter.get('/layers/:id', middleware.userExtractor, async (request, response, next) => {
    try {
        const id = request.params.id
        const user = request.user
        const image = await Image.findById(id).populate('creator')
        if (image) {
            if (user.id !== image.creator.id) {
                return response.status(403).json({ error: 'incorrect user' })
            }
            console.log(fs.existsSync(image.file))
            if (fs.existsSync(image.file)) {
                return response.sendFile(image.file)
            }
        }
        response.status(404).end()
    } catch (exception) {
        next(exception)
    }

})

normalMapsRouter.post('/', middleware.userExtractor, async (request, response, next) => {
    middleware.imageUpload(request, response, async (exception) => {
        if (exception) { next(exception) }
        else {
            try {
                const layers = []
                const number_of_files = request.filenames ? request.filenames.length : 0
                for (var i = 0; i < number_of_files; i++) {
                    const oldfile = path.join(process.cwd(), `../uploads/${request.filenames[i]}`)
                    const newfile = path.join(process.cwd(), `../output/${request.filenames[i]}`)
                    fs.copyFileSync(oldfile, newfile)
                    fs.unlinkSync(oldfile)
                    const layer = new Image({
                        file: newfile,
                        format: request.body.format,
                        creator: request.user.id
                    })
                    await layer.save()
                    layers.push(layer.id)
                }
                const normalMap = new NormalMap({
                    name: `${request.user.id}-${request.timestamp}`,
                    status: 'done',
                    layers,
                    creator: request.user.id
                })
                await normalMap.save()
                response.status(201).json(normalMap)
            } catch (exception) {
                next(exception)
            }
        }
    })
})

normalMapsRouter.post('/:id/layers/', middleware.userExtractor, async (request, response, next) => {
    middleware.imageUpload(request, response, async (exception) => {
        if (exception) { next(exception) }
        else {
            try {
                const normalMap = await NormalMap.findById(request.params.id)
                if (!normalMap) { return response.status(404).end() }
                if (normalMap.creator.toString() !== request.user.id.toString()) {
                    return response.status(403).end()
                }


                const number_of_files = request.filenames ? request.filenames.length : 0
                if (number_of_files !== 1) {
                    for (var i = 0; i < number_of_files; i++) {
                        const file = path.join(process.cwd(), `../uploads/${request.filenames[i]}`)
                        if (fs.existsSync(file)) { fs.unlinkSync(file) }
                    }
                    throw new ValidationError('Invalid number of files.')
                } else {
                    const oldfile = path.join(process.cwd(), `../uploads/${request.filenames[0]}`)
                    const newfile = path.join(process.cwd(), `../output/${request.filenames[0]}`)
                    fs.copyFileSync(oldfile, newfile)
                    fs.unlinkSync(oldfile)

                    const layer = new Image({
                        file: newfile,
                        format: request.body.format,
                        creator: request.user.id
                    })
                    await layer.save()
                    normalMap.layers = [...normalMap.layers, layer]
                    const saved_normalMap = await normalMap.save()
                    response.status(201).json(saved_normalMap)
                }
            } catch (exception) {
                next(exception)
            }
        }
    })
})

normalMapsRouter.post('/photostereo/', middleware.userExtractor, async (request, response, next) => {
    middleware.imageUpload(request, response, async (exception) => {
        if (exception) { next(exception) }
        else {
            try {
                const file_name = `${request.user.id}-${request.timestamp}`
                const format = request.body.format

                let lights = []
                console.log(request.body.lights)
                request.body.lights.forEach(light => {
                    lights = lights.concat(light.split(',').map(Number))
                })
                let data = yaml.dump({
                    rows: request.body.lights.length,
                    cols: 3,
                    dt: 'f',
                    data : lights
                }, { flowLevel: 1 })
                data = '%YAML:1.0\n' + 'Lights: !!opencv-matrix\n' + data.replace(/^/gm, '   ')
                console.log(data)
                const light_matrix_file = path.join(process.cwd(), '../uploads/', `${file_name}_LightMatrix.yml`)

                fs.writeFile(light_matrix_file, data, (err) => {
                    if (err) {
                        console.log(err)
                    }
                })
                const normalMap = new NormalMap({
                    name: file_name,
                    status: 'pending',
                    creator: request.user.id
                })
                const saved_map = await (await normalMap.save()).populate('creator')
                await axios.post(`${PHOTOSTEREO_URI}/${saved_map.id}`, { file_name, format })
                request.user.normalMaps = request.user.normalMaps.concat(saved_map._id)
                await request.user.save()
                response.status(201).json(saved_map)
            } catch (exception) {
                next(exception)
            }
        }
    })
})

normalMapsRouter.delete('/:id', middleware.userExtractor, async (request, response, next) => {
    const id = request.params.id
    const user = request.user
    try {
        const normalMap = await NormalMap.findById(id)
        if (!normalMap) { return response.status(404).end() }
        if (normalMap.creator.toString() === user.id.toString()) {
            await expireNormalMap(id, true)
        } else {
            return response.status(403).json({ error: 'incorrect user' })
        }
        response.status(204).end()
    } catch(exception) {
        next(exception)
    }
})
module.exports = normalMapsRouter