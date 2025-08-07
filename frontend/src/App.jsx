import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, performReLog } from './reducers/loginReducer'
import { initializeUsers } from './reducers/userReducer'
import { initializeNormalMaps } from './reducers/normalMapReducer'
import Notification from './components/Notification'
import LoginForm from './components/Login'
import UserList from './components/UserList'
import User from './components/User'
import ImageUploadForm from './components/ImageUpload'
import NormalMapList from './components/NormalMapList'
import NormalMap from './components/NormalMap'
import NavBar from './components/NavBar'
import { Routes, Route, useLocation, useNavigate} from 'react-router-dom'
import ManualCreation from './components/ManualCreation'

const App = () => {
	const dispatch = useDispatch()
	const user = useSelector((state) => state.login)
	const location = useLocation()
	
	useEffect(() => { dispatch(initializeUsers()) }, [dispatch])
	useEffect(() => { if (user) {dispatch(initializeNormalMaps())} }, [dispatch, user])
	useEffect(() => {
		const loggedUserJSON = window.localStorage.getItem('loggedUser')
		if (loggedUserJSON) {
			const user = JSON.parse(loggedUserJSON)
			dispatch(loginUser(user))
			
		}
		
	}, [dispatch])

	useEffect(() => {
		if (user) {
			dispatch(performReLog())
		}
	}, [user, location])

	return (
		<div>
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
						<Route path="/" element={<h1>Welcome</h1>} />
						<Route path="/users" element={<UserList />} />
						<Route path="/users/:id" element={<User />} />
						<Route path="/normal_map" element={<NormalMapList />} />
						<Route path="/normal_map/manual/:width/:height" element={<ManualCreation />} />
						<Route path="/normal_map/photostereo" element={<ImageUploadForm />} />
						<Route path="/normal_map/:id" element={<NormalMap />} />
					</Routes>
				</div>
			)}
		</div>
	)
}

export default App