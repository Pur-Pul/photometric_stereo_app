import { Link, useLocation, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { performLogout } from '../reducers/loginReducer'
import { AppBar, Button, Toolbar, Box} from '@mui/material';

const NavBar = ({ user }) => {
    const dispatch = useDispatch()
    const location = useLocation()
    const bar = { backgroundColor: 'lightGrey' }
    const padding = { paddingRight: 5, paddingLeft: 5 }
    const logoutHandler = (event) => {
		event.preventDefault()
		dispatch(performLogout())
	}
    const navigate = useNavigate()
    const paths = {
        "/" : "Home",
        "/users" : "Users",
        "/normal_map" : "Normal Maps",
    }
    paths[`/users/${user.id}`] = user.name

    return (
        <AppBar position='static'>
            <Toolbar>
                {Object.keys(paths).map(key => {
                    return <Button key={key} color="inherit" onClick={() => navigate(key)}>
                        {paths[key]}
                    </Button>
                })}
                <Button sx={{ marginLeft: "auto" }} color="error" onClick={logoutHandler}>Logout</Button>
            </Toolbar>
        </AppBar>
    )
}

export default NavBar