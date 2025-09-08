require('dotenv').config()
const {error, info} = require('./logger')
const path = require('path')

const getMongoURI = (node_env, uri) => {
    const parts = uri.split('?')
    const tail = parts.length > 1 ? `?${parts[1]}` : ''
    switch(node_env) {
        case 'production':
            return `${parts[0]}production${tail}`
        case 'developement':
            return `${parts[0]}dev${tail}`
        case 'test':
            return `${parts[0]}test${tail}`
        default:
            throw new Error(`Invalid NODE_ENV: ${node_env}. NODE_ENV needs to be 'production', 'developement' or 'test']`)
    }
}

const { BACK_PORT: PORT, PHOTOSTEREO_URI, EXPIRE_DELAY, UPLOADS_DIR, OUTPUT_DIR, FRONTEND_URL, ADMIN_PASS } = process.env
const MONGODB_URI = getMongoURI(process.env.NODE_ENV, process.env.MONGODB_URI)

if (FRONTEND_URL === undefined) { error('Warning: Frontend URL is undefined.') }
if (MONGODB_URI === undefined) { error('Warning: Mongodb URI is undefined.') }
if (PHOTOSTEREO_URI === undefined) { error('Warning: Photostereo URI is undefined.') }
if (ADMIN_PASS === undefined) { error('Warning: Admin password is undefined. Default admin can not be created.') }

module.exports = {
    PORT: PORT ? PORT : 3001,
    MONGODB_URI,
    PHOTOSTEREO_URI,
    EXPIRE_DELAY: EXPIRE_DELAY ? EXPIRE_DELAY : 30,
    UPLOADS_DIR: UPLOADS_DIR ? UPLOADS_DIR : path.join(process.cwd(), '../uploads/'),
    OUTPUT_DIR: OUTPUT_DIR ? OUTPUT_DIR : path.join(process.cwd(), '../output/'),
    FRONTEND_URL: FRONTEND_URL,
    ADMIN_PASS,
}