import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { performLogout } from '../reducers/loginReducer'
import { AppBar, Button, Toolbar, Box} from '@mui/material';

const NavBar = ({ user }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const logoutHandler = (event) => {
		event.preventDefault()
		dispatch(performLogout())
        navigate('/')
	}
    
    const paths = {
        "/" : "Home",
        "/users" : user.role === 'admin' ? "Users" : null,
        "/normal_map" : "Normal Maps",
    }
    paths[`/users/${user.id}`] = user.name

    return (
        <AppBar position='static' sx={{ borderRadius: '5px' }}>
            <Toolbar>
                {Object.keys(paths).map(key => {
                    if (!paths[key]) { return }
                    return <Button key={key} data-testid={`${paths[key].toLowerCase().replace(' ', '-')}-button`} color="inherit" onClick={() => navigate(key)}>
                        {paths[key]}
                    </Button>
                })}
                <Button sx={{ marginLeft: "auto" }} color="error" onClick={logoutHandler} data-testid='logout-button'>Logout</Button>
            </Toolbar>
        </AppBar>
    )
}

export default NavBar