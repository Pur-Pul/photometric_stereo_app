import { 
    Button,
    TextField,
    Grid,
    FormControl,
    InputLabel,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent
} from '@mui/material'
import { useState } from 'react'

const EmailVerificationForm = ({open, setOpen, email}) => {
    return (
        <Dialog open={open}>
            <DialogTitle>A verfication link has been sent to your email</DialogTitle>
            <DialogContent>
                {email}
            </DialogContent>
            <DialogActions>
                <Button variant='outlined' color='error' onClick={() => setOpen(false)}>Cancel</Button>
                <Button variant='outlined'>Re-send link</Button>
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

    const handleCreate = () => {
        setOpenVerification(true)
    }

    return (
        <Grid container>
            <h1>Create an account</h1>
            <Grid size={12}>
                <TextField id='username' label='Username' value={username} onChange={(e) => setUsername(e.target.value)}/>
            </Grid>
            <Grid size={12}>
                <TextField id='email' label='Email' value={email} onChange={(e) => setEmail(e.target.value)}/>
            </Grid>
            <Grid size={12}>
                <TextField id='password1' label='Password' type='password' value={password1} onChange={(e) => setPassword1(e.target.value)}/>
            </Grid>
            <Grid size={12}>
                <TextField id='password2' label='Re-enter password' type='password' value={password2} onChange={(e) => setPassword2(e.target.value)}/>
            </Grid>
            <Button variant='outlined' onClick={handleCreate}>Create user</Button>
            <EmailVerificationForm open={openVerification} setOpen={setOpenVerification} email={email} />
        </Grid>
    )
}

export default CreateUser