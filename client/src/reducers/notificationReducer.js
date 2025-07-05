import { createSlice } from '@reduxjs/toolkit'

const notificationSlice = createSlice({
	name: 'notification',
	initialState: { text: '', type: 'none' },
	reducers: {
		set(state, action) {
			return action.payload
		},
		remove(state, action) {
			return { text: '', type: 'none' }
		},
	},
})

export const { set, remove } = notificationSlice.actions
export const notificationSet = (message, seconds) => {
	return (dispatch) => {
		dispatch(set(message))
		setTimeout(() => {
			dispatch(remove())
		}, seconds * 1000)
	}
}
export default notificationSlice.reducer