import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import store from '../store'

vi.mock('./NewNormalMapForm', () => {
    return { default: vi.fn(() => <mock-NewNormalMapForm data-testid='new-normal-map-form' />)}
})

const normalMaps = []
vi.mock(import('react-redux'), async (importOriginal) => {
    const actual = await importOriginal()
    return {...actual, useSelector: (selector) => {
        switch (selector({normalMaps: 'normalMaps', login: 'login'})) {
            case 'normalMaps':
                return normalMaps
            case 'login':
                return { username: 'testuser', id:'testuserid' }
            default:
                return undefined
        } 
    }}
})

const mockedNavigate = vi.fn()
vi.mock(import('react-router-dom'), async (importOriginal) => {
    const actual = await importOriginal()
    return {...actual, useNavigate: () => mockedNavigate }
})

vi.mock(import('../reducers/normalMapReducer'), async (importOriginal) => {
    const actual = await importOriginal()
    return {...actual, fetchPage: () => () => {} }
})

import NormalMapList from './NormalMapList'


describe('Normal map list renders.', () => {
    afterEach(() => {
        vi.clearAllMocks()
        normalMaps.length = 0
    })
    test('If no normal maps are found neither of the normal map lists are rendered.', () => {
        render(<Provider store={store}><NormalMapList /></Provider>)
        const userList = screen.queryByTestId('user-normal-map-list')
        const publicList = screen.queryByTestId('public-normal-map-list')
        expect(userList).not.toBeInTheDocument()
        expect(publicList).not.toBeInTheDocument()
    })
    test('If one user normal map is found the user normal map list is rendered.', () => {
        normalMaps.push({id: 'foo', creator: {id: 'testuserid', username: 'testuser'}})
        render(<Provider store={store}><NormalMapList /></Provider>)
        const list = screen.queryByTestId('user-normal-map-list')
        expect(list).toBeInTheDocument()
    })
    test('If one public normal map is found the public normal map list is rendered.', () => {
        normalMaps.push({id: 'foo', creator: {id: 'otheruserid', username: 'otheruser'}})
        render(<Provider store={store}><NormalMapList /></Provider>)
        const list = screen.queryByTestId('public-normal-map-list')
        expect(list).toBeInTheDocument()
    })
    test('If both public and user normal maps are found both normal map lists are rendered.', () => {
        normalMaps.push({id: 'foo', creator: {id: 'otheruserid', username: 'otheruser'}})
        normalMaps.push({id: 'foo', creator: {id: 'testuserid', username: 'testuser'}})

        render(<Provider store={store}><NormalMapList /></Provider>)
        const userList = screen.queryByTestId('public-normal-map-list')
        const publicList = screen.queryByTestId('public-normal-map-list')
        expect(userList).toBeInTheDocument()
        expect(publicList).toBeInTheDocument()
    })
    test('If one normal map is found a normal map link button is rendered.', () => {
        normalMaps.push({id: 'foo', creator: {id: 'testuserid', username: 'testuser'}})
        render(<Provider store={store}><NormalMapList /></Provider>)
        const button = screen.queryByTestId('normal-map-foo')
        expect(button).toBeInTheDocument()
    })
    test('Create new normal map button is rendered.', () => {
        render(<Provider store={store}><NormalMapList /></Provider>)
        const button = screen.queryByTestId('create-new-button')
        expect(button).toBeInTheDocument()
    })
    test('New normal map form is rendered.', () => {
        render(<Provider store={store}><NormalMapList /></Provider>)
        const form = screen.queryByTestId('new-normal-map-form')
        expect(form).toBeInTheDocument()
    })
    test('New normal map form is closed by default.', async () => {
        render(<Provider store={store}><NormalMapList /></Provider>)
        const mockedNewNormalMapForm = await import('./NewNormalMapForm')
        expect(mockedNewNormalMapForm.default.mock.calls.at(-1)[0].open).toBe(false)
    })
})

describe('Normal map list is functional.', () => {
    afterEach(() => {
        vi.clearAllMocks()
        normalMaps.length = 0
    })
    test('If a normal map link is clicked the navigate function is called with \'/normal_map/{id}\'', async () => {
        normalMaps.push({id: 'foo', creator: {id: 'testuserid', username: 'testuser'}})
        const user = userEvent.setup()
        render(<Provider store={store}><NormalMapList /></Provider>)
        const button = screen.getByTestId('normal-map-foo')
        await user.click(button)
        expect(mockedNavigate).toHaveBeenCalledWith('/normal_map/foo')
    })
    test('If the \'CREATE NEW\' button is clicked the new normal map form opens.', async () => {
        const user = userEvent.setup()
        render(<Provider store={store}><NormalMapList /></Provider>)
        const button = screen.getByTestId('create-new-button')
        await user.click(button)
        const mockedNewNormalMapForm = await import('./NewNormalMapForm')
        expect(mockedNewNormalMapForm.default.mock.calls.at(-1)[0].open).toBe(true)
    })
})