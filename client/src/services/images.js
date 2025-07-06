import axios from 'axios'
const baseUrl = '/api/images'

let token = null

const getConfig = () => {
	return { headers: { Authorization: token } }
}

const getAll = async () => {
	const response = await axios.get(baseUrl, getConfig())
	return response.data
}

const get = async (id) => {
	const response = await axios.get(`${baseUrl}/${id}`, getConfig())
	return response.data
}

const post = async (image) => {
	const response = await axios.post(baseUrl, image, getConfig())
	return response.data
}

const update = async (image, id) => {
	const response = await axios.put(`${baseUrl}/${id}`, image, getConfig())
	return response.data
}

const remove = async (id) => {
	const response = await axios.delete(`${baseUrl}/${id}`, getConfig())
	return response.data
}

const setToken = (new_token) => {
	token = `Bearer ${new_token}`
}

export default { get, getAll, post, update, remove, setToken }