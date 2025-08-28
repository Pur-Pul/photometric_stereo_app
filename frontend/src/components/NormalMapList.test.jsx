import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import store from '../store'

//const mockedNewNormalMapForm = 
//const formSpy = 
vi.mock('./NewNormalMapForm', () => {
    return { default: vi.fn(() => <mock-NewNormalMapForm data-testid='new-normal-map-form' />)}
})

const normalMaps = []
vi.mock(import('react-redux'), async (importOriginal) => {
    const actual = await importOriginal()
    return {...actual, useSelector: () => normalMaps }
})

const mockedNavigate = vi.fn()
vi.mock(import('react-router-dom'), async (importOriginal) => {
    const actual = await importOriginal()
    return {...actual, useNavigate: () => mockedNavigate }
})

import NormalMapList from './NormalMapList'

const userObject = {
    id: '1234567890',
    name: 'testUser',
    role: 'user'
}

describe('Normal map list renders.', () => {
    afterEach(() => {
        vi.clearAllMocks()
        normalMaps.length = 0
    })
    test('If no normal maps are found the normal map list is not rendered.', () => {
        render(<Provider store={store}><NormalMapList user={userObject}/></Provider>)
        const list = screen.queryByTestId('normal-map-list')
        expect(list).not.toBeInTheDocument()
    })
    test('If one normal map is found the normal map list is rendered.', () => {
        normalMaps.push({id: 'foo'})
        render(<Provider store={store}><NormalMapList user={userObject}/></Provider>)
        const list = screen.queryByTestId('normal-map-list')
        expect(list).toBeInTheDocument()
    })
    test('Create new normal map button is rendered.', () => {
        render(<Provider store={store}><NormalMapList user={userObject}/></Provider>)
        const button = screen.queryByTestId('create-new-button')
        expect(button).toBeInTheDocument()
    })
    test('New normal map form is rendered.', () => {
        render(<Provider store={store}><NormalMapList user={userObject}/></Provider>)
        const form = screen.queryByTestId('new-normal-map-form')
        expect(form).toBeInTheDocument()
    })
    test('New normal map form is closed by default.', async () => {
        render(<Provider store={store}><NormalMapList user={userObject}/></Provider>)
        const mockedNewNormalMapForm = await import('./NewNormalMapForm')
        expect(mockedNewNormalMapForm.default.mock.calls[0][0].open).toBe(false)
    })
})