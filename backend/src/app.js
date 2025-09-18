const config = require('./utils/config')

const express = require('express')
const app = express()
const cors = require('cors')

const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const logoutRouter = require('./controllers/logout')
const normalMapsRouter = require('./controllers/normalMaps')
const internalRouter = require('./controllers/internal')

const middleware = require('./utils/middleware')

//expireNormalMaps()

app.use(express.static('dist'))
app.use(cors((req, callback) => {
    //console.log(req)
    let options
    if (req.path.startsWith('/internal')) {
        options = { origin: config.PHOTOSTEREO_URI }
    } else {
        options = { origin: config.FRONTEND_URL }
    }
    callback(null, options)
}))
app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/logout', logoutRouter)
app.use('/api/normalMaps', normalMapsRouter)
app.use('/internal', internalRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app