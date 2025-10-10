const User = require('../models/user')
const config = require('./config')
const bcrypt = require('bcrypt')
const logger = require('./logger')
const nodemailer = require('nodemailer')

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

const sendEmail = async (address, subject, text) => {
    if (config.NODE_ENV === 'test' || config.EMAIL === undefined || config.EMAIL_PASS === undefined) {
        const testAccount = nodemailer.createTestAccount()
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        })
        const info = await transporter.sendMail({
            from: 'Normal map app <no-reply@example.com>',
            to: address,
            subject,
            text,
        })
        return info
    } else {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.EMAIL,
                pass: config.EMAIL_PASS
            }
        })

        const info = await transporter.sendMail({
            from: `"Normal map app" <${config.EMAIL}>`,
            to: address,
            subject,
            text,
        })
        return info
    }
}

module.exports = {
    initDatabase,
    sendEmail
}