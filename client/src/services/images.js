import axios from 'axios'
const baseUrl = '/api/images'

let token = null

const getAll = async () => {
	const response = await axios.get(baseUrl)
	return response.data
}

const get = async (id) => {
	const response = await axios.get(`${baseUrl}/${id}`)
	return response.data
}

const post = async (image) => {
	const config = {
		headers: { Authorization: token },
	}

	const response = await axios.post(baseUrl, image, config)
	return response.data
}

const update = async (image, id) => {
	const config = {
		headers: { Authorization: token },
	}

	const response = await axios.put(`${baseUrl}/${id}`, image, config)
	return response.data
}

const remove = async (id) => {
	const config = {
		headers: { Authorization: token },
	}

	const response = await axios.delete(`${baseUrl}/${id}`, config)
	return response.data
}

const setToken = (new_token) => {
	token = `Bearer ${new_token}`
}

export default { get, getAll, post, update, remove, setToken }