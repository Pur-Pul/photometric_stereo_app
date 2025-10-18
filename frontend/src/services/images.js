import axios from 'axios'
const baseUrl = '/api/normalMaps'

let token = null

const getConfig = () => {
    return token ? { headers: { Authorization: token } } : undefined
}

const get = async (id) => {
    const response = await axios.get(`${baseUrl}/${id}`, getConfig())
    return response.data
}

const getAll = async () => {
    const response = await axios.get(baseUrl, getConfig())
    return response.data
}

const getPage = async (page, category) => {
    const response = await axios.get(`${baseUrl}?page=${page}&category=${category}`, getConfig())
    return response.data
}

const getFile = async (normalId, id) => {
    const response = await axios.get(`${baseUrl}/${normalId}/layers/${id}`, { ...getConfig(), responseType: 'blob' })
    return response.data
}

const post = async (data) => {
    const response = await axios.post(`${baseUrl}`, data, { headers: { ...getConfig().headers, 'Content-Type': 'multipart/form-data' } })
    return response.data
}

const put = async (data, id) => {
    const response = await axios.put(`${baseUrl}/${id}`, data, { headers: { ...getConfig().headers, 'Content-Type': 'multipart/form-data' } })
    return response.data
}

const postPhotostereo = async (data) => {
    const response = await axios.post(`${baseUrl}/photostereo`, data, { headers: { ...getConfig().headers, 'Content-Type': 'multipart/form-data' } })
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
    getPage,
    getFile,
    post,
    put,
    postPhotostereo,
    remove,
    setToken
}