import { createSlice } from '@reduxjs/toolkit'
import loginService from '../services/login'
import imageService from '../services/images'
import { notificationSet } from './notificationReducer'

const loginSlice = createSlice({
	name: 'login',
	initialState: null,
	reducers: {
		loginUser(state, action) {
			imageService.setToken(action.payload.token)
			loginService.setToken(action.payload.token)
			return action.payload
		},
		logoutUser(state, action) {
			imageService.setToken('')
			loginService.setToken('')
			return null
		},
	},
})

export const { loginUser, logoutUser } = loginSlice.actions

export const performLogin = (credentials) => {
	return async (dispatch) => {
		
		const response = await loginService.login(credentials)
		window.localStorage.setItem('loggedUser', JSON.stringify(response))
		dispatch(loginUser(response))
	}
}

export const performLogout = () => {
	return async (dispatch) => {
		const response = await loginService.logout()
		window.localStorage.removeItem('loggedUser')
		dispatch(logoutUser())
	}
}

export const performReLog = (user) => {
	return async (dispatch) => {
		try {
			await loginService.get()
		} catch(exception) {
			if (exception.response.status == 401) {
				dispatch(performLogout())
				dispatch(notificationSet({ text: 'Session expired', type: 'error'}, 5))
			}
		}
	}
}

export default loginSlice.reducer