import notificationReducer from './reducers/notificationReducer.js'
import loginReducer from './reducers/loginReducer.js'
import userReducer from './reducers/userReducer.js'
import imageReducer from './reducers/imageReducer.js'
import { configureStore } from '@reduxjs/toolkit'

const store = configureStore({
	reducer: {
		notification: notificationReducer,
		login: loginReducer,
		users: userReducer,
		images: imageReducer
	},
})

export default store