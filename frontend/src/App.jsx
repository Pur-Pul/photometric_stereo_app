import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser } from './reducers/loginReducer'
import { initializeUsers } from './reducers/userReducer'
import { initializeImages } from './reducers/imageReducer'
import Notification from './components/Notification'
import LoginForm from './components/Login'
import UserList from './components/UserList'
import User from './components/User'
import ImageUploadForm from './components/ImageUpload'
import NormalMapList from './components/NormalMapList'
import NormalMap from './components/NormalMap'
import NavBar from './components/NavBar'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

const App = () => {
	const dispatch = useDispatch()
	const user = useSelector((state) => state.login)
	
	useEffect(() => { dispatch(initializeUsers()) }, [dispatch])
	useEffect(() => { if (user) {dispatch(initializeImages())} }, [dispatch, user])


	useEffect(() => {
		const loggedUserJSON = window.localStorage.getItem('loggedUser')
		if (loggedUserJSON) {
			const user = JSON.parse(loggedUserJSON)
			dispatch(loginUser(user))
		}
	}, [dispatch])



	return (
		<Router>
			{user === null ? (
				<div>
					<Notification />
					<LoginForm />
				</div>
			) : (
				<div>
					<NavBar user={user}/>
					<Notification />
					<Routes>
						<Route path="/" element={<ImageUploadForm />} />
						<Route path="/users" element={<UserList />} />
						<Route path="/users/:id" element={<User />} />
						<Route path="/normal_map" element={<NormalMapList />} />
						<Route path="/normal_map/:id" element={<NormalMap />} />
					</Routes>
				</div>
			)}
		</Router>
	)
}

export default App