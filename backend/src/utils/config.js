require('dotenv').config()
const path = require('path')

const PORT = process.env.BACK_PORT
const PHOTOSTEREO_URI = process.env.PHOTOSTEREO_URI
const MONGODB_URI = process.env.MONGODB_URI
const EXPIRE_DELAY = process.env.EXPIRE_DELAY
const UPLOADS_DIR = process.env.UPLOADS_DIR
const OUTPUT_DIR = process.env.OUTPUT_DIR
console.log(PHOTOSTEREO_URI)
module.exports = {
	PORT: PORT ? PORT : 3001,
	MONGODB_URI,
	PHOTOSTEREO_URI,
	EXPIRE_DELAY: EXPIRE_DELAY ? EXPIRE_DELAY : 30,
	UPLOADS_DIR: UPLOADS_DIR ? UPLOADS_DIR : path.join(process.cwd(), '../uploads/'),
	OUTPUT_DIR: OUTPUT_DIR ? OUTPUT_DIR : path.join(process.cwd(), '../output/')
}