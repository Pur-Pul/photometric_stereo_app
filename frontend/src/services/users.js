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

export default { getAll, setToken }