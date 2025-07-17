import axios from 'axios'
const baseUrl = '/api/login'

let token = null

const setToken = (new_token) => {
	token = `Bearer ${new_token}`
}

const getConfig = () => {
	return { headers: { Authorization: token } }
}

const login = async (user) => {
	const response = await axios.post(baseUrl, user)
	return response.data
}

const logout = async () => {
	const response = await axios.delete('/api/logout', getConfig())
	return response.data
}

const get = async (user) => {
	const response = await axios.get(baseUrl, getConfig())
	return response.data
}

export default { login, logout, setToken, get }