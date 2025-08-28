import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import store from '../store'

const mockedNavigate = vi.fn()
vi.mock(import('react-router-dom'), async (importOriginal) => {
    const actual = await importOriginal()
    return {...actual, useNavigate: () => mockedNavigate }
})

const mockedPerformLogout = vi.fn()
vi.mock(import('../reducers/loginReducer'), async (importOriginal) => {
    const actual = await importOriginal()
    return {...actual, performLogout: () => mockedPerformLogout }
})

import NavBar from './NavBar'

const userObject = {
    id: '1234567890',
    name: 'testUser',
    role: 'user'
}

describe('NavBar renders', () => {
    test('Home button is visible.', () => {
        render(<Provider store={store}><NavBar user={userObject}/></Provider>)
        const homeButton = screen.queryByTestId('home-button')
        expect(homeButton).toBeInTheDocument()
    })
    test('Normal maps button is visible.', () => {
        render(<Provider store={store}><NavBar user={userObject}/></Provider>)
        const normalMapsButton = screen.queryByTestId('normal-maps-button')
        expect(normalMapsButton).toBeInTheDocument()
    })
    test('Users button is invisible to user role.', () => {
        render(<Provider store={store}><NavBar user={userObject}/></Provider>)
        const usersButton = screen.queryByTestId('users-button')
        expect(usersButton).not.toBeInTheDocument()
    })
    test('Users button is visible to admin role.', () => {
        render(<Provider store={store}><NavBar user={{...userObject, role: 'admin'}}/></Provider>)
        const usersButton = screen.queryByTestId('users-button')
        expect(usersButton).toBeInTheDocument()
    })
    test('User profile button is visible.', () => {
        render(<Provider store={store}><NavBar user={userObject}/></Provider>)
        const profileButton = screen.queryByTestId('testuser-button')
        expect(profileButton).toBeInTheDocument()
    })
    test('Logout button is visible.', () => {
        render(<Provider store={store}><NavBar user={userObject}/></Provider>)
        const logoutButton = screen.queryByTestId('logout-button')
        expect(logoutButton).toBeInTheDocument()
    })
})

describe('NavBar is functional', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })
    
    describe('Home button is functional.', () => {
        test('Home button calls navigate function when clicked.', async () => {
            render(<Provider store={store}><NavBar user={userObject}/></Provider>)
            const user = userEvent.setup()
            const homeButton = screen.queryByTestId('home-button')
            await user.click(homeButton)
            expect(mockedNavigate).toHaveBeenCalledTimes(1)
        })
        test('Home button calls navigate function with \'/\' when clicked.', async () => {
            render(<Provider store={store}><NavBar user={userObject}/></Provider>)
            const user = userEvent.setup()
            const homeButton = screen.queryByTestId('home-button')
            await user.click(homeButton)
            expect(mockedNavigate).toHaveBeenCalledWith('/')
        })
    })
    
    describe('Normal maps button is functional.', () => {
        test('Normal maps button calls navigate function when clicked.', async () => {
            render(<Provider store={store}><NavBar user={userObject}/></Provider>)
            const user = userEvent.setup()
            const normalMapsButton = screen.queryByTestId('normal-maps-button')
            await user.click(normalMapsButton)
            expect(mockedNavigate).toHaveBeenCalledTimes(1)
        })
        test('Normal maps button calls navigate function with \'/normal_map\' when clicked.', async () => {
            render(<Provider store={store}><NavBar user={userObject}/></Provider>)
            const user = userEvent.setup()
            const normalMapsButton = screen.queryByTestId('normal-maps-button')
            await user.click(normalMapsButton)
            expect(mockedNavigate).toHaveBeenCalledWith('/normal_map')
        })
    })

    describe('Users button is functional.', () => {
        test('Users button calls navigate function when clicked.', async () => {
            render(<Provider store={store}><NavBar user={{...userObject, role: 'admin'}}/></Provider>)
            const user = userEvent.setup()
            const usersButton = screen.queryByTestId('users-button')
            await user.click(usersButton)
            expect(mockedNavigate).toHaveBeenCalledTimes(1)
        })
        test('Users button calls navigate function with \'/users\' when clicked.', async () => {
            render(<Provider store={store}><NavBar user={{...userObject, role: 'admin'}}/></Provider>)
            const user = userEvent.setup()
            const usersButton = screen.queryByTestId('users-button')
            await user.click(usersButton)
            expect(mockedNavigate).toHaveBeenCalledWith('/users')
        })
    })

    describe('User profile button is functional.', () => {
        test('User profile button calls navigate function when clicked.', async () => {
            render(<Provider store={store}><NavBar user={userObject}/></Provider>)
            const user = userEvent.setup()
            const profileButton = screen.queryByTestId('testuser-button')
            await user.click(profileButton)
            expect(mockedNavigate).toHaveBeenCalledTimes(1)
        })
        test('User profile button calls navigate function with \'/users/{userid}\' when clicked.', async () => {
            render(<Provider store={store}><NavBar user={userObject}/></Provider>)
            const user = userEvent.setup()
            const profileButton = screen.queryByTestId('testuser-button')
            await user.click(profileButton)
            expect(mockedNavigate).toHaveBeenCalledWith('/users/1234567890')
        })
    })

    describe('Logout button is functional.', () => {
        test('Logout button calls performLogout function when clicked.', async () => {
            render(<Provider store={store}><NavBar user={userObject}/></Provider>)
            const user = userEvent.setup()
            const logoutButton = screen.queryByTestId('logout-button')
            await user.click(logoutButton)
            expect(mockedPerformLogout).toHaveBeenCalledTimes(1)
        })
    })
})