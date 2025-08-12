import { useSelector, useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { notificationRemove } from '../reducers/notificationReducer'
import { Alert } from '@mui/material'


const Notification = () => {
	const dispatch = useDispatch()
	const location = useLocation()
	useEffect(() => { 
		if (notification.type === 'warning') {
			dispatch(notificationRemove())
		} }, [location]
	)	
	const notification = useSelector(state => state.notification)
	if (notification.type === 'none') {
		return null
	}
	return <Alert severity={notification.type}>{notification.text}</Alert>
}

export default Notification