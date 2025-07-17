const mongoose = require('mongoose')
const imageSchema = new mongoose.Schema(
	{
		file: { type: String, required: true },
		format: { type: String, required: false},
		status: { type: String, require: true},
		creator: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		}
	}, {
		timestamps: true
	}
)

imageSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
	}
})
module.exports = mongoose.model('Image', imageSchema)
