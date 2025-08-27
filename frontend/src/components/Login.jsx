import { useState } from 'react'
import { performLogin } from '../reducers/loginReducer'
import { notificationSet } from '../reducers/notificationReducer.js'
import { useDispatch } from 'react-redux'

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
		<div>
			<h1>login to application</h1>
			<form onSubmit={loginHandler}>
				<div>
					username
					<input
						type="text"
						value={username}
						name="Username"
						onChange={({ target }) => setUsername(target.value)}
						data-testid='login-username'
					/>
				</div>
				<div>
					password
					<input
						type="password"
						value={password}
						name="Password"
						onChange={({ target }) => setPassword(target.value)}
						data-testid='login-password'
					/>
				</div>
				<button type="submit" data-testid='login-button'>login</button>
			</form>
		</div>
	)
}

export default LoginForm