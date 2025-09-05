const mongoose = require('mongoose')
const normalMapSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        status: { type: String, required: true },
        layers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Image',
        }],
        icon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Image',
        },
        flatImage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Image',
        },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        visibility: {
            type: String,
            enum: ['public', 'private'],
            default: 'private',
            required: true
        }
    }, {
        timestamps: true
    }
)

normalMapSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})
module.exports = mongoose.model('NormalMap', normalMapSchema)
