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
const { info } = require('../utils/logger')
const { expireNormalMap } = require('../utils/expiration_manager')
const { createCanvas, loadImage } = require('canvas')

const flattenLayers = async (layers, file, id=undefined) => {
    let canvas
    for (var i = 0; i < layers.length; i++) {
        const image = await loadImage(layers[i].file)
        canvas = canvas === undefined ? createCanvas(image.width, image.height) : canvas
        const ctx = canvas.getContext('2d')
        ctx.drawImage(image, 0, 0, image.width, image.height)

    }
    fs.writeFileSync(file, canvas.toBuffer('image/png'))
    let flatImage
    if (id) {
        flatImage = await Image.findById(id)
        flatImage.file = file
        flatImage.updatedAt = Date.now()
    } else {
        flatImage = new Image({
            file,
            creator : layers[0].creator
        })
    }

    await flatImage.save()
    return flatImage
}

const createIcon = async (flatImage, file, id=undefined) => {
    const canvas = createCanvas(64,64)
    const ctx = canvas.getContext('2d')
    const image  = await loadImage(flatImage.file)

    ctx.drawImage(image, 0, 0, 64, 64)
    fs.writeFileSync(file, canvas.toBuffer('image/png'))
    let icon
    if (id) {
        icon = await Image.findById(id)
        icon.file = file
        icon.updatedAt = Date.now()
    } else {
        icon = new Image({
            file,
            creator: flatImage.creator
        })
    }


    await icon.save()
    return icon
}

normalMapsRouter.get('/', middleware.userExtractor, async (request, response) => {
    const { page, category } = request.query
    const user = request.user
    if (page && isNaN(page)) { return response.status(400).end() }

    const offset = page ? (page-1) * 10 : 0
    let filter = {}
    switch (category) {
    case 'private':
        filter = { creator: user }
        break
    case 'public':
        filter = { visibility: 'public' }
        break
    default:
    }


    if (user) {
        const normalMaps = await NormalMap.find(filter).sort({ createdAt: 1 }).skip(offset).limit(10).populate('creator')
        response.json(normalMaps)
    }
})

normalMapsRouter.get('/:id', middleware.userExtractor, async (request, response) => {
    const id = request.params.id
    const user = request.user
    const normalMap = await NormalMap.findById(id).populate('creator')
    if (!normalMap) { return response.status(404).json({ message: 'Normal map not found.' }) }
    if (user.id !== normalMap.creator.id && normalMap.visibility !== 'public') { return response.status(403).json({ error: 'incorrect user' }) }

    response.json(normalMap)
})

normalMapsRouter.get('/:normalId/layers/:id', middleware.userExtractor, async (request, response, next) => {
    try {
        const id = request.params.id
        const normalId = request.params.normalId
        const user = request.user
        const normalMap = await NormalMap.findById(normalId)
        const image = await Image.findById(id).populate('creator')
        if (normalMap && image) {
            if (user.id !== image.creator.id && normalMap.visibility !== 'public') {
                return response.status(403).json({ error: 'incorrect user' })
            }
            if (fs.existsSync(image.file)) {
                return response.sendFile(image.file)
            }
        }
        response.status(404).json({ message: 'Image not found.' })
    } catch (exception) {
        next(exception)
    }

})

normalMapsRouter.post('/', middleware.userExtractor, async (request, response, next) => {
    middleware.imageUpload(request, response, async (exception) => {
        if (exception) { next(exception) }
        else {
            try {
                if (!request.body || !request.body.name) { throw new ValidationError('Name is required')}
                const name = request.body.name
                const creator = request.user
                const layers = []
                const number_of_files = request.filenames ? request.filenames.length : 0
                const normalMap = new NormalMap({
                    name,
                    status: 'done',
                    creator: creator.id
                })

                for (var i = 0; i < number_of_files; i++) {
                    const oldfile = path.join(process.cwd(), `../uploads/${request.filenames[i]}`)
                    const newfile = path.join(process.cwd(), `../output/${normalMap.id}-${request.originalFilenames[i]}`)
                    fs.copyFileSync(oldfile, newfile)
                    fs.unlinkSync(oldfile)
                    const image = new Image({
                        file: newfile,
                        creator: creator.id
                    })
                    await image.save()
                    layers.push(image)
                }
                const flatImage = number_of_files > 0 ? await flattenLayers(layers, path.join(process.cwd(), `../output/${normalMap.id}-flat.png`)) : { id: null }
                const icon = flatImage.id !== null ? await createIcon(flatImage, path.join(process.cwd(), `../output/${normalMap.id}-icon.png`)) : { id: null }

                normalMap.layers = layers.map(layer => layer.id)
                normalMap.flatImage = flatImage.id
                normalMap.icon = icon.id
                await normalMap.save()
                const savedNormalMap = await normalMap.populate('creator')

                creator.normalMaps = [...creator.normalMaps, normalMap.id]
                await creator.save()
                response.status(201).json(savedNormalMap)
            } catch (exception) {
                next(exception)
            }
        }
    })
})

normalMapsRouter.put('/:id', middleware.userExtractor, async (request, response, next) => {
    middleware.imageUpload(request, response, async (exception) => {
        if (exception) { next(exception) }
        else {
            try {
                const { visibility } = request.body ? request.body : {}

                const normalMap = await NormalMap.findById(request.params.id).populate('layers')
                if (!normalMap) { response.status(404).json({ message: 'Normal map not found.' }) }
                if (!request.user.normalMaps.includes(normalMap.id)) { return response.status(403).json({ error: 'incorrect user' }) }

                const layers = []
                if (request.filenames) {
                    for (var i = 0; i < request.filenames.length; i++) {
                        const oldfile = path.join(process.cwd(), `../uploads/${request.filenames[i]}`)
                        const newfile = path.join(process.cwd(), `../output/${normalMap.id}-${request.originalFilenames[i]}`)
                        fs.copyFileSync(oldfile, newfile)
                        fs.unlinkSync(oldfile)
                        let layer = normalMap.layers.find((layer) => layer.file === newfile)
                        if (!layer) {
                            layer = new Image({
                                file: newfile,
                                creator: normalMap.creator
                            })
                        }
                        await layer.save()
                        layers.push(layer)

                    }
                    for (var i = 0; i < normalMap.layers.length; i++) {
                        if (layers.find(layer => layer.id.toString() === normalMap.layers[i].id.toString())) { continue }
                        if (fs.existsSync(normalMap.layers[i].file)) {
                            fs.unlinkSync(normalMap.layers[i].file)
                            info(`Image ${normalMap.layers[i].file} has been deleted.`)
                        }
                        await Image.findByIdAndDelete(normalMap.layers[i].id)
                    }

                    const flatImage = await flattenLayers(layers, path.join(process.cwd(), `../output/${normalMap.id}-flat.png`), normalMap.flatImage)
                    const icon = await createIcon(flatImage, path.join(process.cwd(), `../output/${normalMap.id}-icon.png`))
                    normalMap.layers = layers.map(layer => layer.id)
                    normalMap.flatImage = flatImage.id
                    normalMap.icon = icon.id
                }



                normalMap.visibility = visibility ? visibility : normalMap.visibility
                await normalMap.save()

                const savedNormalMap = await normalMap.populate('creator')
                response.status(201).json(savedNormalMap)
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
                const creator = request.user
                const file_name = `${creator.id}-${request.timestamp}`

                if (!request.body || !request.body.name) { throw new ValidationError('Name is required')}
                const name = request.body.name

                if (!request.body.format) { throw new ValidationError('Format is required')}
                const format = request.body.format
                if (!request.originalFilenames.find(file => file.split('.')[0] === 'mask')) { throw new ValidationError('Mask is required.') }
                if (request.originalFilenames.length-1 < 2) { throw new ValidationError('At least two images are required.') }
                if (!request.body instanceof Array || request.originalFilenames.length-1 !== request.body.lights) { throw new ValidationError('Number of images and light directions need to be the same.') }

                let lights = []
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
                const light_matrix_file = path.join(process.cwd(), '../uploads/', `${file_name}_LightMatrix.yml`)

                fs.writeFileSync(light_matrix_file, data)
                const normalMap = new NormalMap({
                    name,
                    status: 'pending',
                    creator: creator.id
                })
                const savedNormalMap = await (await normalMap.save()).populate('creator')
                await axios.post(`${PHOTOSTEREO_URI}/${savedNormalMap.id}`, { file_name, format })

                creator.normalMaps = creator.normalMaps.concat(savedNormalMap._id)
                await creator.save()

                response.status(201).json(savedNormalMap)
            } catch (exception) {
                request.filenames.forEach(file => {
                    const filePath = path.join(process.cwd(), `../uploads/${file}`)
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath)
                    }
                })
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
        if (!normalMap) { return response.status(404).json({ message: 'Normal map not found.' }) }
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