require('dotenv').config()

const PORT = process.env.BACK_PORT
const PHOTOSTEREO_URI = process.env.PHOTOSTEREO_URI
const MONGODB_URI = process.env.MONGODB_URI
const EXPIRE_DELAY = process.env.EXPIRE_DELAY
console.log(PHOTOSTEREO_URI)
module.exports = {
	PORT: PORT ? PORT : 3001,
	MONGODB_URI,
	PHOTOSTEREO_URI,
	EXPIRE_DELAY: EXPIRE_DELAY ? EXPIRE_DELAY : 30
}