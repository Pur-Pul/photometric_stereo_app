import {
    Button,
    TextField,
    Grid,
    Typography,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent
} from '@mui/material'
import { useState } from 'react'
import { AxiosError } from 'axios'
import { notificationSet } from '../reducers/notificationReducer'
import { useDispatch } from 'react-redux'
import userService from '../services/users'
import { Link } from 'react-router-dom'

const EmailVerificationForm = ({ open, setOpen, email, handleResend }) => {
    return (
        <Dialog open={open}>
            <DialogTitle>A verfication link has been sent to your email</DialogTitle>
            <DialogContent>
                {email}
            </DialogContent>
            <DialogActions>
                <Button variant='outlined' color='error' onClick={() => setOpen(false)}>Cancel</Button>
                <Button variant='outlined' onClick={handleResend}>Re-send link</Button>
            </DialogActions>
        </Dialog>
    )
}

const CreateUser = () => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password1, setPassword1] = useState('')
    const [password2, setPassword2] = useState('')
    const [openVerification, setOpenVerification] = useState(false)
    const dispatch = useDispatch()

    const handleCreate = async () => {
        if (password1 !== password2) {
            dispatch(notificationSet({ text: 'Passwords must match.', type: 'error' }), 5)
            return
        }
        try {
            await userService.post({
                username,
                email,
                password: password1
            })
            setOpenVerification(true)
        } catch (exception) {
            if (exception instanceof AxiosError) {
                dispatch(notificationSet({ text: exception.response.data ? exception.response.data.error : 'An error occured.', type: 'error' }), 5)
            } else {
                throw exception
            }
        }
    }
    const handleResend = async () => {
        try {
            await userService.resendVerification({
                username,
                email,
                password: password1
            })
        } catch (exception) {
            if (exception instanceof AxiosError) {
                dispatch(notificationSet({ text: exception.response.data ? exception.response.data.error : 'An error occured.', type: 'error' }), 5)
            } else {
                throw exception
            }
        }
    }

    return (
        <Grid container spacing={2} margin={3}>
            <Grid>
                <Typography variant='h2'>Create an account</Typography>
                <Typography variant='subtitle1'>An account is required in order to use the application. Your email address will only be visible to yourself.</Typography>
                <Typography>Do you already have an account? <Link to='/login'>Please login</Link></Typography>
            </Grid>
            <Grid size={12}>
                <Grid>
                    <TextField id='username' label='Username' value={username} onChange={(e) => setUsername(e.target.value)}/>
                </Grid>
                <Grid>
                    <TextField id='email' label='Email' value={email} onChange={(e) => setEmail(e.target.value)}/>
                </Grid>
                <Grid>
                    <TextField id='password1' label='Password' type='password' value={password1} onChange={(e) => setPassword1(e.target.value)}/>
                </Grid>
                <Grid>
                    <TextField id='password2' label='Re-enter password' type='password' value={password2} onChange={(e) => setPassword2(e.target.value)}/>
                </Grid>
            </Grid>

            <Button variant='outlined' onClick={handleCreate}>Create user</Button>
            <EmailVerificationForm open={openVerification} setOpen={setOpenVerification} email={email} handleResend={handleResend}/>
        </Grid>
    )
}

export default CreateUser