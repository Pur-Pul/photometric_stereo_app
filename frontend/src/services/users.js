import axios from 'axios'
const baseUrl = '/api/users'

let token = null

const setToken = (new_token) => {
	token = `Bearer ${new_token}`
}

const getConfig = () => {
	return { headers: { Authorization: token } }
}

const getAll = async () => {
	const response = await axios.get(baseUrl, getConfig())
	return response.data
}

const remove = async (id) => {
	const response = await axios.delete(`${baseUrl}/${id}`, getConfig())
	return response.data
}

const update = async (user) => {
	const response = await axios.put(`${baseUrl}/${user.id}`, user, getConfig())
	return response.data
}

const post = async (user) => {
	const response = await axios.post(`${baseUrl}`, user)
	return response.data
}

const verify = async (token) => {
	const response = await axios.get(`${baseUrl}/verify-email`, { headers: { Authorization: `Bearer ${token}` }})
	return response.data
}

const resendVerification = async (user) => {
	const response = await axios.post(`${baseUrl}/resend-verification`, user)
	return response.data
}

export default { getAll, setToken, remove, update, post, verify, resendVerification }