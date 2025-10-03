import { useState } from 'react'
import { performLogin } from '../reducers/loginReducer'
import { notificationSet } from '../reducers/notificationReducer.js'
import { useDispatch } from 'react-redux'
import {
    Button,
    TextField,
    Grid,
    Typography
} from '@mui/material'
import { Link } from 'react-router-dom'

const LoginForm = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const dispatch = useDispatch()

    const loginHandler = (event) => {
        event.preventDefault()
        dispatch(performLogin({ username: username, password: password }))
            .then(() => {
                setUsername('')
                setPassword('')
            })
            .catch((exception) => {
                console.log(exception)
                dispatch(
                    notificationSet(
                        { text: exception.response ? exception.response.data.error : 'Unkown error', type: 'error' },
                        5
                    )
                )
            })
    }

    return (
        <form onSubmit={loginHandler}>
            <Grid container spacing={2} margin={3}>
                <Grid>
                    <Typography variant='h2'>Login</Typography>
                    <Typography variant='subtitle1'>Please login to use the application.</Typography>
                    <Typography>Are you a new user? <Link to='/create-user'>Please register</Link></Typography>
                </Grid>
                <Grid size={12}>
                    <Grid>
                        <TextField
                            type="text"
                            label="username"
                            value={username}
                            name="Username"
                            onChange={({ target }) => setUsername(target.value)}
                            slotProps={{ htmlInput : { 'data-testid': 'login-username' } }}
                        />
                    </Grid>
                    <Grid>
                        <TextField
                            type="password"
                            label="password"
                            value={password}
                            name="Password"
                            onChange={({ target }) => setPassword(target.value)}
                            slotProps={{ htmlInput : { 'data-testid': 'login-password' } }}
                        />
                    </Grid>
                </Grid>
                <Grid>
                    <Button variant="outlined" type="submit" data-testid='login-button'>login</Button>
                </Grid>
            </Grid>
        </form>
    )
}

export default LoginForm