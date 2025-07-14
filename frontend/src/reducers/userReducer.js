import { createSlice } from '@reduxjs/toolkit'
import userService from '../services/users'

const userSlice = createSlice({
	name: 'user',
	initialState: [],
	reducers: {
		appendUser(state, action) {},
		setUsers(state, action) {
			return action.payload
		},
		deleteUser(state, action) {},
		updateUser(state, action) {
			const user_index = state.findIndex(
				(user) => user.id === action.payload.id
			)
			state[user_index] = action.payload
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

export default userSlice.reducer