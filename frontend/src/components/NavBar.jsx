import { Link, useLocation } from "react-router-dom"
import { useDispatch } from "react-redux"
import { performLogout } from '../reducers/loginReducer'

const NavBar = ({ user }) => {
    const dispatch = useDispatch()
    const location = useLocation()
    const bar = { backgroundColor: 'lightGrey' }
    const padding = { paddingRight: 5, paddingLeft: 5 }
    const logoutHandler = (event) => {
		event.preventDefault()
		dispatch(performLogout())
	}
    const paths = {
        "/" : "Home",
        "/users" : "Users",
        "/normal_map" : "Normal Maps",
    }
    paths[`/users/${user.id}`] = user.name

    return (
        <p style={bar}>
            {Object.keys(paths).map(key => {
                return <Link key={key} style={{ ...padding, backgroundColor : location.pathname == key ? 'darkGrey' : bar.backgroundColor }} to={key}>{paths[key]}</Link>
            })}
            <button onClick={logoutHandler}>logout</button>
        </p>
    )
}

export default NavBar