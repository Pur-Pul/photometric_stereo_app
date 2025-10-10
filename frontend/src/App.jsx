import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, performReLog } from './reducers/loginReducer'
import { initializeUsers } from './reducers/userReducer'
import { fetchPage } from './reducers/normalMapReducer'
import Notification from './components/Notification'
import LoginForm from './components/Login'
import UserList from './components/UserList'
import User from './components/User'
import PhotometricForm from './components/PhotometricForm'
import NormalMapList from './components/NormalMapList'
import NormalMap from './components/NormalMap'
import NavBar from './components/NavBar'
import { Routes, Route, useLocation } from 'react-router-dom'
import ManualCreation from './components/ManualCreation'
import CreateUser from './components/CreateUser'
import VerifyUser from './components/VerifyUser'
import FrontPage from './components/FrontPage'

const App = () => {
    const dispatch = useDispatch()
    const user = useSelector((state) => state.login)
    const location = useLocation()

    useEffect(() => { if (user) { dispatch(initializeUsers()) }}, [dispatch, user])
    useEffect(() => { if (user) { dispatch(fetchPage(1, 'private')) }}, [dispatch, user])
    useEffect(() => { if (user) { dispatch(fetchPage(1, 'public')) }}, [dispatch, user])
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
                    <NavBar user={user} paths={{
                        '/' : 'Login',
                        'create-user': 'Register',
                    }}/>
                    <Notification />
                    <Routes>
                        <Route path="/" element={ <LoginForm /> } />
                        <Route path="/create-user" element={<CreateUser />} />
                        <Route path="/verify-user/:token" element={<VerifyUser />} />
                    </Routes>

                </div>
            ) : (
                <div>
                    <NavBar user={user} paths={{
                        '/' : 'Home',
                        '/users' : user.role === 'admin' ? 'Users' : null,
                        [`/users/${user.id}`]: user.name,
                        '/normal_map' : 'Normal Maps'
                    }}/>
                    <div>
                        <Notification />
                        <Routes >
                            <Route path="/" element={<FrontPage />} />

                            <Route path="/users" element={user.role === 'admin' ? <UserList /> : null } />
                            <Route path="/users/:id" element={<User />} />
                            <Route path="/normal_map" element={<NormalMapList />} />
                            <Route path="/normal_map/manual/:width/:height" element={<ManualCreation />} />
                            <Route path="/normal_map/photostereo" element={<PhotometricForm />} />
                            <Route path="/normal_map/:id" element={<NormalMap />} />
                        </Routes>
                    </div>

                </div>
            )}
        </div>
    )
}

export default App