require('dotenv').config()
const path = require('path')

const getMongoURI = (node_env, uri) => {
    switch(node_env) {
        case 'production':
            return `${uri}production`
        case 'developement':
            return `${uri}dev`
        case 'test':
            return `${uri}test`
        default:
            throw new Error(`Invalid NODE_ENV: ${node_env}. NODE_ENV needs to be 'production', 'developement' or 'test']`)
    }
}

const PORT = process.env.BACK_PORT
const PHOTOSTEREO_URI = process.env.PHOTOSTEREO_URI
const MONGODB_URI = getMongoURI(process.env.NODE_ENV, process.env.MONGODB_URI)
const EXPIRE_DELAY = process.env.EXPIRE_DELAY
const UPLOADS_DIR = process.env.UPLOADS_DIR
const OUTPUT_DIR = process.env.OUTPUT_DIR


module.exports = {
    PORT: PORT ? PORT : 3001,
    MONGODB_URI,
    PHOTOSTEREO_URI,
    EXPIRE_DELAY: EXPIRE_DELAY ? EXPIRE_DELAY : 30,
    UPLOADS_DIR: UPLOADS_DIR ? UPLOADS_DIR : path.join(process.cwd(), '../uploads/'),
    OUTPUT_DIR: OUTPUT_DIR ? OUTPUT_DIR : path.join(process.cwd(), '../output/')
}