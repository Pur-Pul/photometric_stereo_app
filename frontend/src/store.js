import notificationReducer from './reducers/notificationReducer.js'
import loginReducer from './reducers/loginReducer.js'
import userReducer from './reducers/userReducer.js'
import normalMapReducer from './reducers/normalMapReducer.js'
import { configureStore } from '@reduxjs/toolkit'

const store = configureStore({
    reducer: {
        notification: notificationReducer,
        login: loginReducer,
        users: userReducer,
        normalMaps: normalMapReducer
    },
})

export default store