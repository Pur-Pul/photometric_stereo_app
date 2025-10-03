import { useSelector, useDispatch } from 'react-redux'
import { Alert } from '@mui/material'


const Notification = () => {
    const notification = useSelector(state => state.notification)
    if (notification.type === 'none') {
        return null
    }
    return <Alert severity={notification.type}>{notification.text}</Alert>
}

export default Notification