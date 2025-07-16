const internalRouter = require('express').Router()
const Image = require('../models/image')

internalRouter.put('/images/:file_name', async (request, response, next) => {
    try {
        const new_image = request.body
        const result = await Image.findOneAndUpdate({ file:request.params.file_name }, new_image, { new: true, runValidators: true, context: 'query' })
        response.status(201).json(result)
    } catch(exception) {
        next(exception)
    }
})
module.exports = internalRouter