import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock(import("../reducers/notificationReducer.js"), async (importOriginal) => {
    const actual = await importOriginal()
    return {...actual, notificationSet: vi.fn(() => ( async () => {} ))}
})

vi.mock(import("../reducers/loginReducer.js"), async (importOriginal) => {
    const actual = await importOriginal()
    return {...actual, performLogin: vi.fn(({username, password}) => ( async () => {
        if (username === 'incorrect' || password === 'incorrect') { throw new Error('invalid username or password.') }
    } ))}
})

import Login from './Login'

import { Provider } from 'react-redux'
import store from '../store'


describe("Login form", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });
    test('Login button is rendered', () => {
        render(<Provider store={store}><Login /></Provider>)
        const loginButton = screen.getByTestId('login-button')
        expect(loginButton).toBeInTheDocument()
    })
    test('Username field is rendered', () => {
        render(<Provider store={store}><Login /></Provider>)
        const loginUsername = screen.getByTestId('login-username')
        expect(loginUsername).toBeInTheDocument()
    })
    test('Password field is rendered', () => {
        render(<Provider store={store}><Login /></Provider>)
        const loginPassword = screen.getByTestId('login-password')
        expect(loginPassword).toBeInTheDocument()
    })
    test('Clicking login calls performLogin.', async () => {
        render(
            <Provider store={store}>
                <Login/>
            </Provider>
        )
        const user = userEvent.setup()
        const loginButton = screen.getByTestId('login-button')
        await user.click(loginButton)
        const { performLogin } = await import('../reducers/loginReducer')
        expect(performLogin).toHaveBeenCalledTimes(1)
    })
    test('Clicking login calls performLogin with provided username and password.', async () => {
        render(
            <Provider store={store}>
                <Login/>
            </Provider>
        )
        const user = userEvent.setup()
        const loginButton = screen.getByTestId('login-button')
        const loginUsername = screen.getByTestId('login-username')
        const loginPassword = screen.getByTestId('login-password')
        await user.type(loginUsername, 'test')
	    await user.type(loginPassword, 'pass')
        await user.click(loginButton)
        const { performLogin } = await import('../reducers/loginReducer')
        expect(performLogin).toHaveBeenCalledWith(
            {username: 'test', password: 'pass'}
        )
    })
    test('If performLogin throws an error, notificationSet is called.', async () => {
        render(
            <Provider store={store}>
                <Login/>
            </Provider>
        )
        const user = userEvent.setup()
        const loginButton = screen.getByTestId('login-button')
        const loginUsername = screen.getByTestId('login-username')
        const loginPassword = screen.getByTestId('login-password')
        await user.type(loginUsername, 'incorrect')
	    await user.type(loginPassword, 'incorrect')
        await user.click(loginButton)
        const { notificationSet } = await import('../reducers/notificationReducer')
        expect(notificationSet).toHaveBeenCalledTimes(1)
    })
})