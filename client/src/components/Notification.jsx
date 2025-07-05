import { useSelector } from 'react-redux'

const Notification = () => {
	const notification = useSelector((state) => {
		return state.notification
	})
	if (notification.type === 'none') {
		return null
	}

	return <div className={notification.type}>{notification.text}</div>
}

export default Notification