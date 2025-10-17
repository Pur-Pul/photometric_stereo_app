import { createSlice } from '@reduxjs/toolkit'
import loginService from '../services/login'
import imageService from '../services/images'
import userService from '../services/users'
import { notificationSet } from './notificationReducer'
import { AxiosError } from 'axios'

const loginSlice = createSlice({
    name: 'login',
    initialState: null,
    reducers: {
        loginUser(state, action) {
            imageService.setToken(action.payload.token)
            loginService.setToken(action.payload.token)
            userService.setToken(action.payload.token)
            return action.payload
        },
        logoutUser(state, action) {
            imageService.setToken('')
            loginService.setToken('')
            userService.setToken('')
            return null
        },
    },
})

export const { loginUser, logoutUser } = loginSlice.actions

export const performLogin = (credentials) => {
    return async (dispatch) => {
        try {
            const response = await loginService.login(credentials)
            window.localStorage.setItem('loggedUser', JSON.stringify(response))
            dispatch(loginUser(response))
        } catch (exception) {
            if (exception instanceof AxiosError && exception.response.status === 401) {
                window.localStorage.removeItem('loggedUser')
            }
            console.log(exception) //eslint-disable-line no-console
            dispatch(notificationSet({ text: exception?.response?.data?.error ?? 'An error occurred', type:'error' }, 5))
        }
    }
}

export const performLogout = () => {
    return async (dispatch) => {
        try {
            await loginService.logout()
            window.localStorage.removeItem('loggedUser')
            dispatch(logoutUser())
        } catch (exception) {
            if (exception instanceof AxiosError && exception.response.status === 401) {
                window.localStorage.removeItem('loggedUser')
            }
            console.log(exception) //eslint-disable-line no-console
            dispatch(notificationSet({ text: exception?.response?.data?.error ?? 'An error occurred', type:'error' }, 5))
        }
    }
}

export const performReLog = (user) => {
    return async (dispatch) => {
        try {
            await loginService.get()
        } catch(exception) {
            if (exception instanceof AxiosError && exception.response.status === 401) {
                dispatch(performLogout())
                dispatch(notificationSet({ text: 'Session expired', type: 'error' }, 5))
            }
        }
    }
}

export default loginSlice.reducer