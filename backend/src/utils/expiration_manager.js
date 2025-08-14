const Session = require('../models/session')
const Image = require('../models/image')
const NormalMap = require('../models/normalMap')
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

const expireNormalMap = async (id, force=false) => {
    const normalMap = await NormalMap.findById(id)
    if (normalMap) {
        const expiration_time = normalMap.updatedAt - new Date() + EXPIRE_DELAY * 60 * 1000
        if (force || expiration_time <= 0) {
            const images = normalMap.icon ? [...normalMap.layers, normalMap.icon] : normalMap.layers
            console.log(images)
            for (var i=0; i < images.length; i++) {
                const image = await Image.findById(images[i])
                if (fs.existsSync(image.file)) {
                    fs.unlinkSync(image.file)
                    info(`Image ${image.file} has been deleted.`)
                }
                await Image.findByIdAndDelete(images[i])
            }
            const creator = await User.findById(normalMap.creator.toString())
            if (creator) {
                const nm_index = creator.normalMaps.findIndex((nm) => nm.toString() === id.toString())
                creator.normalMaps.splice(nm_index, 1)
                await creator.save()
            }
            await NormalMap.findByIdAndDelete(id)
            info('Normal map', id, 'deleted')
        } else {
            info('Normal map', id, 'will be deleted in', expiration_time/1000, 'seconds.')
            setTimeout(async () => await expireNormalMap(id), expiration_time)
        }
    }
}

const expireNormalMaps = async () => {
    const normalMaps = await NormalMap.find({})
    for (const normalMap of normalMaps) {
        expireNormalMap(normalMap.id)
    }
}

module.exports = {
    expireSessions,
    expireSession,
    expireNormalMaps,
    expireNormalMap
}