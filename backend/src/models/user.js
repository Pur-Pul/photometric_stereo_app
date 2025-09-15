const mongoose = require('mongoose')
const validator = require('validator')
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            minLength: 3,
            required: [true, 'Username is required'],
            unique: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            validate: {
                validator: (email) => {
                    return validator.isEmail(email)
                },
                message: props => `${props.value} is not a valid email address.`
            }
        },
        name: String,
        passwordHash: {
            type: String,
            minLength: 3,
            required: [true, 'Password is required'],
        },
        normalMaps: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'NormalMap',
            },
        ],
        role: {
            type: String,
            enum: ['admin', 'user'],
            default: 'user',
            required: true
        },
        verified: {
            type: Boolean,
            default: false,
            required: true
        }
    }, {
        timestamps: true
    }
)

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.passwordHash
    },
})

module.exports = mongoose.model('User', userSchema)