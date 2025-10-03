import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import userService from '../services/users'
import { useDispatch } from 'react-redux'
import { notificationSet } from '../reducers/notificationReducer'

const VerifyUser = () => {
    const { token } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    useEffect(() => {
        const verify = async () => {
            try {
                await userService.verify(token)
                dispatch(notificationSet({ text: 'Verification succeeded', type: 'success' }), 5)
            } catch(exception) {
                console.log(exception)
                dispatch(notificationSet({ text: exception.response && exception.response.data ? exception.response.data.error : 'An error occoured', type: 'error' }), 5)
            }
            navigate('/')
        }
        if(token) {
            verify()
        }
    }, [token, dispatch, navigate])
}

export default VerifyUser
