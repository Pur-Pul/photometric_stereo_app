const imagesRouter = require('express').Router()
const Image = require('../models/image')
const middleware = require('../utils/middleware')
const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const { PHOTOSTEREO_URI } = require('../utils/config')
const user = require('../models/user')

imagesRouter.get('/', middleware.userExtractor, async (request, response) => {
    const user = request.user
	if (user) {
		const images = await Image.find({ creator: user }).populate('creator')
		response.json(images)
	}
})

imagesRouter.get('/file/:id', middleware.userExtractor, async (request, response) => {
	const id = request.params.id
    const user = request.user
	const image = await Image.findById(id).populate('creator')
    if (user.id != image.creator.id) {
        return response.status(403).json({ error: 'incorrect user' })
    }
	const file_path = path.join(__dirname, '../output/', `${image.file}_normal_map${image.format}`)
	if (image.status="done" && fs.existsSync(file_path)) {
		response.sendFile(file_path)
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

imagesRouter.post('/', middleware.userExtractor, async (request, response, next) => {
	middleware.imageUpload(request, response, async (exception) => {
		if (exception) { next(exception) }
		else {
			try {
				const file_name = `${request.user.id}-${request.timestamp}`
				const format = request.body.format

				let lights = []
				request.body.lights.forEach(light => {
					lights = lights.concat(light.split(',').map(Number))
				})
				let data = yaml.dump({
						rows: request.body.lights.length,
						cols: 3,
						dt: 'f',
						data : lights
					}, { flowLevel: 1})
				data = '%YAML:1.0\n' + 'Lights: !!opencv-matrix\n' + data.replace(/^/gm, '   ')
				
				const light_matrix_file = path.join(__dirname, '../uploads/', `${file_name}_LightMatrix.yml`)

				fs.writeFile(light_matrix_file, data, (err) => {
					if (err) {
						console.log(err);
					}
				});
				console.log(`${PHOTOSTEREO_URI}/${file_name}`)
				await axios.post(`${PHOTOSTEREO_URI}/${file_name}`, { format })

				const image = new Image({
					file: file_name,
					format : "",
					status: "pending",
					creator: request.user.id
				})
				const saved_image = await (await image.save()).populate('creator')
				request.user.images = request.user.images.concat(saved_image._id)
				await request.user.save()
				response.status(201).json(saved_image)
			} catch (exception) {
				next(exception)
			}
		}
	})
	
})

imagesRouter.delete('/:id', middleware.userExtractor, async (request, response, next) => {
	const id = request.params.id
    const user = request.user
	try {
		const image = await Image.findById(id)
		if (image.creator.toString() === user.id.toString()) {
			const file_path = path.join(__dirname, '../output/', `${image.file}_normal_map${image.format}`)
			if (fs.existsSync(file_path)) { fs.unlinkSync(file_path) }
			await Image.findByIdAndDelete(id)
			const image_index = user.images.findIndex((image) => image.toString === id.toString())
			user.images.splice(image_index, 1)
			await user.save()
			response.status(204).end()
		} else {
			return response.status(403).json({ error: 'incorrect user' })
		}
	} catch(exception) {
		next(exception)
	}
})
module.exports = imagesRouter