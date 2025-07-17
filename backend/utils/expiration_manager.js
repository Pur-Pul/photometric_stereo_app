const Session = require('../models/session')
const Image = require('../models/image')
const User = require('../models/user')
const { EXPIRE_DELAY } = require('./config')
const { info, error } = require('./logger')
const fs = require('fs')
const path = require('path')

const expireSession = async (id) => {
	const session = await Session.findById(id)
	if (session) {
		const expiration_time = session.updatedAt - new Date() + EXPIRE_DELAY * 60 * 1000
		if (expiration_time <= 0) {
			await Session.findByIdAndDelete(id)
			info('Session', id, 'expired')
		} else {
			info('Session', id, 'will expire in', expiration_time/1000, 'seconds.')
			setTimeout(async () => await expireSession(id), expiration_time)
		}
	}
}

const expireSessions = async () => {
	const sessions = await Session.find({})
	for (const session of sessions) {
		expireSession(session.id)
	}
}

const expireImage = async (id) => {
	const image = await Image.findById(id)
	if (image) {
		const expiration_time = image.updatedAt - new Date() + EXPIRE_DELAY * 60 * 1000
		if (expiration_time <= 0) {
			const creator = await User.findById(image.creator)
			const file_path = path.join(__dirname, '../output/', `${image.file}_normal_map${image.format}`)
			if (fs.existsSync(file_path)) { fs.unlinkSync(file_path) }

			const image_index = creator.images.findIndex((image) => image.toString === id.toString())
			creator.images.splice(image_index, 1)
			await creator.save()
			await Image.findByIdAndDelete(id)
			info('Image', id, 'deleted')
		} else {
			info('Image', id, 'will be deleted in', expiration_time/1000, 'seconds.')
			setTimeout(async () => await expireImage(id), expiration_time)
		}
	}
}

const expireImages = async () => {
	const images = await Image.find({})
	for (const image of images) {
		expireImage(image.id)
	}
} 

module.exports = {
	expireSessions,
	expireSession,
	expireImages,
	expireImage
}