import axios from 'axios'
const baseUrl = '/api/normalMaps'

let token = null

const getConfig = () => {
	return { headers: { Authorization: token } }
}

const get = async (id) => {
	const response = await axios.get(`${baseUrl}/${id}`, getConfig())
	return response.data
}

const getAll = async () => {
	const response = await axios.get(baseUrl, getConfig())
	return response.data
}

const getFile = async (id) => {
	const response = await axios.get(`${baseUrl}/layers/${id}`, { ...getConfig(), responseType: 'blob' })
	return response.data
}

const post = async (data) => {
	const response = await axios.post(`${baseUrl}`, data, { headers: {...getConfig().headers, 'Content-Type': 'multipart/form-data'}})
	return response.data
}

const postPhotostereo = async (data) => {
	const response = await axios.post(`${baseUrl}/photostereo`, data, { headers: {...getConfig().headers, 'Content-Type': 'multipart/form-data'}})
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

export default { 
	get,
	getAll,
	getFile,
	post,
	postPhotostereo,
	update,
	remove,
	setToken
}