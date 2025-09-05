const internalRouter = require('express').Router()
const Image = require('../models/image')
const NormalMap = require('../models/normalMap')
const { expireNormalMap } = require('../utils/expiration_manager')
const fs = require('fs')
const path = require('path')
const { createCanvas, loadImage } = require('canvas')

internalRouter.put('/images/:id', async (request, response, next) => {
    try {
        
        const normalMap = await NormalMap.findById(request.params.id)
        const imageFile = path.join(process.cwd(), `../output/${normalMap.id}-layer-0.png`)
        const iconFile = path.join(process.cwd(), `../output/${normalMap.id}-icon.png`)
        fs.copyFileSync(request.body.file, imageFile)
        fs.unlinkSync(request.body.file)

        const new_image = new Image({
            file: imageFile,
            creator: normalMap.creator
        })

        await new_image.save()

        const canvas = createCanvas(64,64)
        const ctx = canvas.getContext('2d')
        const image  = await loadImage(imageFile)

        ctx.drawImage(image, 0, 0, 64, 64)
        fs.writeFileSync(iconFile, canvas.toBuffer('image/png'))

        const new_icon = new Image({
            file: iconFile,
            creator: normalMap.creator
        })

        await new_icon.save()

        normalMap.flatImage = new_image.id
        normalMap.icon = new_icon.id

        normalMap.status = 'done'
        await normalMap.save()
        //expireNormalMap(normalMap.id)
        response.status(201).end()
    } catch(exception) {
        next(exception)
    }
})
module.exports = internalRouter