const imagesRouter = require('express').Router()
const path = require('path')
const fs = require('fs')
const Image = require('../models/image')
const middleware = require('../utils/middleware')

const clear_temp = (next) => {
	fs.unlink(temp_path, (exception) => {
		if (exception) { next(exception) }
	})
}

imagesRouter.get('/', middleware.userExtractor, async (request, response) => {
    const user = request.user
	if (user) {
		const images = await Image.find({ creator: user }).populate('creator')
		response.json(images)
	}
})

imagesRouter.get('/:id', middleware.userExtractor, async (request, response) => {
	const id = request.params.id
    const user = request.user
	const image = await Image.findById(id).populate('creator')
    if (user.id != image.creator.id) {
        return response.status(403).json({ error: 'incorrect user' })
    }
	response.json(image)
})

/*
imagesRouter.post('/', middleware.imageUpload.single("file"), middleware.userExtractor, async (request, response, next) => {
	try {
		console.log(request.file)
		const temp_path = request.file.path
		const target_path = path.join(__dirname, "../uploads/image.png");
		const creator = request.user

		if (path.extname(request.file.originalname).toLowerCase() === ".png") {
			fs.rename(temp_path, target_path, async (exception) => {
				if (exception) { next(exception) }
				let image = new Image({ creator: creator.id, file: target_path})
				let saved_image = await image.save()
				saved_image = await saved_image.populate('creator')

				creator.images = creator.images.concat(saved_image._id)
				await creator.save()

				response.status(201).json(saved_image)
			})
		} else {
			clear_temp(next)
			response.status(403).end("Only .png files are allowed!")
		}
	} catch(exception) {
		next(exception)
	}
})
*/
imagesRouter.post('/', middleware.userExtractor, async (request, response, next) => {
	middleware.imagesUpload(request, response, (exception) => {
		if (exception) { next(exception) }
		else { response.status(200).end('Images uploaded.') }
	})
})

imagesRouter.delete('/:id', middleware.userExtractor, async (request, response, next) => {
	const id = request.params.id
    const user = request.user
	
	const image = await Image.findById(id)

    if (image.creator.toString() === user.id.toString()) {
        await Image.findByIdAndDelete(id)
        const image_index = user.images.findIndex((image) => image.toString === id.toString())
        user.images.splice(image_index, 1)
        await user.save()
        response.status(204).end()
    } else {
        return response.status(403).json({ error: 'incorrect user' })
    }
	
})

imagesRouter.put('/:id', middleware.userExtractor, async (request, response, next) => {
	const id = request.params.id
    const user = request.user
    const old_image = await Image.findById(id).populate('creator')
    if (old_image.creator.id != user.id) {
        return response.status(403).json({ error: 'incorrect user' })
    }
    
	const new_image = request.body
	try {
		const result = await Image.findByIdAndUpdate(id, new_image, { new: true, runValidators: true, context: 'query' }).populate('creator')
		response.status(201).json(result)
	} catch(exception) {
		next(exception)
	}
})
module.exports = imagesRouter