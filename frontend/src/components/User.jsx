import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import NormalMapList from './NormalMapList'
import {
    Button,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    TextField,
    InputLabel,
    FormControl,
    IconButton,
    Grid,
    Select,
    MenuItem,
    List,
    ListItem
} from '@mui/material'
import { useState, useEffect } from 'react'
import pencil from '../static/pencil32.png'
import { performUserDelete, performUserUpdate } from '../reducers/userReducer'

const DeleteForm = ({ owner, user }) => {
    const [openDeleteForm, setOpenDeleteForm] = useState(false)
    const [password, setPassword] = useState('')
    const dispatch = useDispatch()
    const handleClose = () => {
        setPassword('')
        setOpenDeleteForm(false)
    }
    const handleDelete = () => {
        dispatch(performUserDelete(user, password))
    }

    return (
        <div>
            <Button variant='contained' color='error' onClick={() => setOpenDeleteForm(true)}>Delete account</Button>
            <Dialog open={openDeleteForm} onClose={handleClose} closeAfterTransition={false}>
                <DialogTitle>{`You are about to delete ${owner} account.`}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid size={12}>Please re-enter your password to confirm</Grid>
                        <TextField type='password' label='password' value={password} onChange={(e) => setPassword(e.target.value)}/>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' onClick={handleClose}>Cancel</Button>
                    <Button variant='contained' color='error' onClick={handleDelete}>Delete</Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

const SaveForm = ({ owner, openSaveForm, handleCancel, updatedUser }) => {
    const [password, setPassword] = useState('')
    const dispatch = useDispatch()
    const handleClose = () => {
        setPassword('')
        handleCancel()
    }

    const handleUpdate = () => {
        dispatch(performUserUpdate(updatedUser, password))
    }

    return (
        <div>
            <Dialog open={openSaveForm} onClose={handleClose} closeAfterTransition={false}>
                <DialogTitle>{`You are about to update ${owner} account settings.`}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid size={12}>Please re-enter your password to confirm</Grid>
                        <TextField type='password' label='password' value={password} onChange={(e) => setPassword(e.target.value)}/>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' color='error' onClick={handleClose}>Cancel</Button>
                    <Button variant='contained' color='info' onClick={handleUpdate}>Save</Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

const InputElement = ({ id, edit, type, value, setter, children }) => {
    switch(type) {
    case 'input':
        return <TextField
            id={id}
            variant='standard'
            margin='normal'
            value={value}
            onChange={(e) => setter(e.target.value)}
            disabled={!edit}
        />
    case 'select':
        return <Select
            value={value}
            variant='standard'
            color='#ff0000'
            onChange={(e) => setter(e.target.value)}
            disabled={!edit}
        >
            {children}
        </Select>
    }
}

const EditButton = ({ edit, setEdit, handleSave }) => {
    const [hover, setHover] = useState(false)
    return <IconButton
        sx={{
            border: '2px solid',
            width: '40px',
            height: '40px',
            margin: '5px',
            color: hover
                ? (edit ? '#6fbf73' : '#2196f3')
                : (edit ? '#4caf50' : '#4dabf5')
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => {
            if (edit) { handleSave() }
            setEdit(!edit)
        }}
    >
        {
            edit
                ? '✓'
                : <img
                    src={pencil}
                    style={{
                        width: '20px',
                        filter: hover
                            ? 'brightness(0) saturate(100%) invert(38%) sepia(100%) saturate(439%) hue-rotate(164deg) brightness(113%) contrast(98%)'
                            : 'brightness(0) saturate(100%) invert(78%) sepia(37%) saturate(6890%) hue-rotate(181deg) brightness(100%) contrast(93%)'
                    }}

                />
        }
    </IconButton>
}

const UserField = ({ label, type, value, setter, children, allowEdit, handleSave }) => {
    const id = label.toLowerCase()

    const [edit, setEdit] = useState(false)

    return (
        <FormControl>
            <InputLabel sx={{ backgroundColor: '#ffffff' }} htmlFor={id} shrink>{label}</InputLabel>
            <Grid
                container
                paddingLeft={1}
                spacing={2}
                sx={{
                    alignItems: 'center',
                    border: '1px solid',
                    borderRadius: 1,
                    minHeight: '50px'
                }}
            >
                <InputElement id={id} edit={edit} type={type} value={value} setter={setter}>
                    { children }
                </InputElement>
                { allowEdit ? <EditButton edit={edit} setEdit={setEdit} handleSave={handleSave} /> : null }

            </Grid>
        </FormControl>
    )
}

const User = () => {
    const id = useParams().id
    const user = useSelector(state => state.users).find(user => user.id === id)
    const loggedUser = window.localStorage.getItem('loggedUser') ? JSON.parse(window.localStorage.getItem('loggedUser')) : {}
    const [username, setUsername] = useState('')
    const [name, setName] = useState('')
    const [role, setRole] = useState('')
    const [openSaveForm, setOpenSaveForm] = useState(false)

    useEffect(() => {
        if (user) {
            setUsername(user.username)
            setRole(user.role)
            setName(user.name)
        }
    }, [user])

    const handleSave = () => {
        setOpenSaveForm(true)
    }

    const handleCancel = () => {
        setOpenSaveForm(false)
        setUsername(user.username)
        setRole(user.role)
        setName(user.name)
    }

    if (!user) { return null }

    return (
        <div>
            <h1>{user.username}</h1>
            <List>
                <ListItem>
                    <UserField
                        type='input'
                        label='Username'
                        value={username}
                        setter={setUsername}
                        allowEdit={loggedUser.id === user.id || loggedUser.role === 'admin'}
                        handleSave={handleSave}
                    />
                </ListItem>
                {	name
                    ? <ListItem>
                        <UserField
                            type='input'
                            label='Name'
                            value={name}
                            setter={setName}
                            allowEdit={loggedUser.id === user.id}
                            handleSave={handleSave}
                        />
                    </ListItem>
                    : null
                }
                <ListItem>
                    <UserField
                        type='select'
                        label='Role'
                        value={role}
                        setter={setRole}
                        allowEdit={loggedUser.id !== user.id && loggedUser.role === 'admin'}
                        handleSave={handleSave}
                    >
                        <MenuItem value='admin'>Admin</MenuItem>
                        <MenuItem value='user'>User</MenuItem>
                    </UserField>
                </ListItem>
                <ListItem>
					Last online {new Date(user.updatedAt).toLocaleDateString('fi')} at {new Date(user.updatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </ListItem>
                <ListItem>
					User since {new Date(user.createdAt).toLocaleDateString('fi')}
                </ListItem>
            </List>
            <NormalMapList user={user} />
            {
                user.id === loggedUser.id || loggedUser.role === 'admin'
                    ? <div>
                        <DeleteForm
                            owner={user.id === loggedUser.id ? 'your' : `${user.username}'s`}
                            user={user}
                        />
                        <SaveForm
                            owner={user.id === loggedUser.id ? 'your' : `${user.username}'s`}
                            openSaveForm={openSaveForm}
                            handleCancel={handleCancel}
                            updatedUser={{ ...user, username, role, name }}
                        />
                    </div>
                    : null
            }
        </div>
    )
}

export default User