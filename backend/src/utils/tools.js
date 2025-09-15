const User = require('../models/user')
const config = require('./config')
const bcrypt = require('bcrypt')
const logger = require('./logger')

const initDatabase = async () => {
    try {
        const admin = await User.findOne({ role: 'admin', username: 'admin' })
        if (admin === null && config.ADMIN_PASS !== undefined) {
            const passwordHash = await bcrypt.hash(config.ADMIN_PASS, 10)
            const user = new User({
                username: 'admin',
                email: 'admin@test.com',
                name: 'admin',
                passwordHash,
                role: 'admin',
                verified: true
            })
            user.save()
            logger.info('Default admin created.')
        }
    } catch (error) {
        logger.error('Error: Failed to initialize database.', error.name, error.message)
    }
}

module.exports = {
    initDatabase
} 