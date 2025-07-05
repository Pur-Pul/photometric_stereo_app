import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, performLogout } from './reducers/loginReducer'
import { initializeUsers } from './reducers/userReducer'
import Notification from './components/Notification'
import LoginForm from './components/Login'
import UserList from './components/UserList'
import User from './components/User'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

const App = () => {
	const user = useSelector((state) => {
		return state.login
	})
	const dispatch = useDispatch()
	useEffect(() => {
		dispatch(initializeUsers())
	}, [dispatch])

	useEffect(() => {
		const loggedUserJSON = window.localStorage.getItem('loggedUser')
		if (loggedUserJSON) {
			const user = JSON.parse(loggedUserJSON)
			dispatch(loginUser(user))
		}
	}, [dispatch])

	const logoutHandler = (event) => {
		event.preventDefault()
		dispatch(performLogout())
	}

	const padding = { paddingRight: 5, paddingLeft: 5 }
	const bar = { backgroundColor: 'lightGrey' }

	return (
		<Router>
			<Notification />
			{user === null ? (
				<LoginForm />
			) : (
				<div>
					<p style={bar}>
						<Link style={padding} to="/users">
							Users
						</Link>
						<span style={padding}>{user.name} logged-in</span>
						<button onClick={logoutHandler}>logout</button>
					</p>
					<Routes>
						<Route path="/" element={<div>Hello World</div>} />
						<Route path="/users" element={<UserList />} />
						<Route path="/users/:id" element={<User />} />
					</Routes>
				</div>
			)}
		</Router>
	)
}

export default App