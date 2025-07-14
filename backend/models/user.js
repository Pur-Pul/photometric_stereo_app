const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
	username: {
		type: String,
		minLength: 3,
		required: true,
		unique: true,
	},
	name: String,
	passwordHash: {
		type: String,
		minLength: 3,
		required: true,
	},
	images: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Image',
		},
	],
})

userSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
		delete returnedObject.passwordHash
	},
})

module.exports = mongoose.model('User', userSchema)