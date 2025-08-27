const internalRouter = require('express').Router()
const Image = require('../models/image')
const NormalMap = require('../models/normalMap')
const { expireNormalMap } = require('../utils/expiration_manager')
const fs = require('fs')
const path = require('path')

internalRouter.put('/images/:id', async (request, response, next) => {
    try {
        const normalMap = await NormalMap.findById(request.params.id)
        const newfile = path.join(process.cwd(), `../output/${normalMap.name}-layer-0.png`)
        fs.copyFileSync(request.body.file, newfile)
        fs.unlinkSync(request.body.file)

        const new_image = new Image({
            file: newfile,
            creator: normalMap.creator
        })
        await new_image.save()
        normalMap.layers = [new_image.id]
        normalMap.status = 'done'
        await normalMap.save()
        //expireNormalMap(normalMap.id)
        response.status(201).end()
    } catch(exception) {
        next(exception)
    }
})
module.exports = internalRouter