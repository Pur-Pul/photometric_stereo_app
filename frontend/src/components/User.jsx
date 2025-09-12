import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
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
	Grid

} from '@mui/material'
import { useState, useEffect } from 'react'
import pencil from '../static/pencil32.png'

const DeleteForm = ({owner}) => {
	const [openDeleteForm, setOpenDeleteForm] = useState(false)
	const [password, setPassword] = useState('')
	const handleClose = () => {
		setPassword('')
		setOpenDeleteForm(false)
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
					<Button variant='contained' color='error'>Delete</Button>
				</DialogActions>
			</Dialog>
		</div>
	)
}

const User = () => {
	const id = useParams().id
	const user = useSelector(state => state.users).find(user => user.id === id)
	const loggedUser = window.localStorage.getItem('loggedUser') ? JSON.parse(window.localStorage.getItem('loggedUser')) : {}
	const [username, setUsername] = useState('')
	
	useEffect(() => {
		if (user) {
			setUsername(user.username)
		}
	}, [user])

	if (!user) { return null }
	
	return (
		<div>
			<h1>{user.username}</h1>
			<FormControl>
				<InputLabel sx={{backgroundColor: '#ffffff'}} htmlFor='username' shrink>Username</InputLabel>
				<Grid container paddingLeft={1} spacing={2} style={{ border: '1px solid', borderRadius: 5}}>
					<TextField 
						id='username'
						variant='standard'
						margin='normal'
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						disabled
						/>
					<IconButton 
						sx={{
							border: '2px solid',
							width: '50px',
							height: '50px',
							margin: '5px'
							}} 
						><img src={pencil} />
					</IconButton>
				</Grid>
			</FormControl>
			
			<h3>Role: {user.role}</h3>
			<NormalMapList user={user} />
			{ 
				user.id === loggedUser.id || loggedUser.role === 'admin' 
					? <DeleteForm owner={user.id === loggedUser.id ? 'your' : `${user.username}'s`}/>
					: null
			}
		</div>
	)
}

export default User