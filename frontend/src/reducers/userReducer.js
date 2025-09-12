import { createSlice } from '@reduxjs/toolkit'
import userService from '../services/users'
import loginService from '../services/login'
import { notificationSet } from './notificationReducer'

const userSlice = createSlice({
	name: 'user',
	initialState: [],
	reducers: {
		appendUser(state, action) {},
		setUsers(state, action) {
			return action.payload
		},
		deleteUser(state, action) {
			const user_index = state.findIndex(
				(user) => user.id === action.payload.id
			)
			const newState = [...state]
			newState.splice(user_index, 1)
			return newState

		},
		updateUser(state, action) {
			const user_index = state.findIndex(
				(user) => user.id === action.payload.id
			)
			const newState = [...state]
			newState[user_index] = action.payload
			return newState
		},
	},
})

export const { appendUSer, setUsers, deleteUser, updateUser } =
	userSlice.actions

export const initializeUsers = () => {
	return async (dispatch) => {
		let users = await userService.getAll()
		dispatch(setUsers(users))
	}
}

export const performUserDelete = (user, password) => {
	return async (dispatch) => {
		try {
			await loginService.relog(password)
			await userService.remove(id)
			dispatch(deleteUser(user))
		} catch (exception) {
			dispatch(notificationSet({ text: exception.response && exception.response.data.error ? exception.response.data.error : 'An error occurred', type:'error' }, 5))
		}
	}
}

export const performUserUpdate = (updatedUser, password) => {
	return async (dispatch) => {
		try {
			await loginService.relog(password)
			const returnedUser = await userService.update(updatedUser)
			dispatch(updateUser(returnedUser))
		} catch (exception) {
			console.log(exception)
			dispatch(notificationSet({ text: exception.response && exception.response.data.error ? exception.response.data.error : 'An error occurred', type:'error' }, 5))
		}
	}
}

export default userSlice.reducer