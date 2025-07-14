require('dotenv').config()

const PORT = process.env.BACK_PORT
const PHOTOSTEREO_URI = process.env.PHOTOSTEREO_URI
const MONGODB_URI = process.env.MONGODB_URI
console.log(PHOTOSTEREO_URI)
module.exports = {
	PORT,
	MONGODB_URI,
	PHOTOSTEREO_URI
}