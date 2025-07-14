import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
const User = () => {
	const id = useParams().id
	const user = useSelector((state) => state.users).find(
		(user) => user.id === id
	)
	if (!user) {
		return null
	}

	return (
		<div>
			<h1>{user.name}</h1>
			<h2>Images</h2>
            <ul>
                <li>TODO</li>
			</ul>
		</div>
	)
}

export default User