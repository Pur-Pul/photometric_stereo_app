require('dotenv').config()

const PORT = process.env.PORT
const PHOTOSTEREO_URI = `http://localhost:${process.env.PHOTOSTEREO_PORT}/`
const MONGODB_URI = process.env.MONGODB_URI

module.exports = {
	PORT,
	MONGODB_URI,
	PHOTOSTEREO_URI
}