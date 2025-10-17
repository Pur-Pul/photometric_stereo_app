const healthRouter = require('express').Router()

healthRouter.get('/', async (request, response) => {
	response.json('ok')
})

module.exports = healthRouter