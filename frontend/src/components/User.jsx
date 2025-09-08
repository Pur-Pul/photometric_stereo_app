import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import NormalMapList from './NormalMapList'
const User = () => {
	const id = useParams().id
	const user = useSelector(state => state.users).find(user => user.id === id)

	if (!user) { return null }
	
	return (
		<div>
			<h1>{user.username}</h1>
			<h3>Role: {user.role}</h3>
			<NormalMapList user={user} />
		</div>
	)
}

export default User