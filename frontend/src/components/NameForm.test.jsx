import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import store from '../store'




import NameForm from './NameForm'

describe('Name form renders', () => {
    test('Name title is visible when form is open', () => {
        render(<Provider store={store}><NameForm open={ true } handleSave={ () => {} } handleCancel={ () => {} } /></Provider>)
        const title = screen.queryByTestId('name-form-title')
        expect(title).toBeInTheDocument()
    })
    test('Name title is not visible when form is not open', () => {
        render(<Provider store={store}><NameForm open={ false } handleSave={ () => {} } handleCancel={ () => {} } /></Provider>)
        const title = screen.queryByTestId('name-form-title')
        expect(title).not.toBeInTheDocument()
    })
    
    test('Name input is visible when form is open', () => {
        render(<Provider store={store}><NameForm open={ true } handleSave={ () => {} } handleCancel={ () => {} } /></Provider>)
        const input = screen.queryByTestId('name-form-input')
        expect(input).toBeInTheDocument()
    })
    test('Name input is not visible when form is not open', () => {
        render(<Provider store={store}><NameForm open={ false } handleSave={ () => {} } handleCancel={ () => {} } /></Provider>)
        const input = screen.queryByTestId('name-form-input')
        expect(input).not.toBeInTheDocument()
    })

    test('Cancel button is visible when form is open', () => {
        render(<Provider store={store}><NameForm open={ true } handleSave={ () => {} } handleCancel={ () => {} } /></Provider>)
        const button = screen.queryByTestId('name-form-cancel')
        expect(button).toBeInTheDocument()
    })
    test('Cancel button is not visible when form is not open', () => {
        render(<Provider store={store}><NameForm open={ false } handleSave={ () => {} } handleCancel={ () => {} } /></Provider>)
        const button = screen.queryByTestId('name-form-cancel')
        expect(button).not.toBeInTheDocument()
    })

    test('Save button is visible when form is open', () => {
        render(<Provider store={store}><NameForm open={ true } handleSave={ () => {} } handleCancel={ () => {} } /></Provider>)
        const button = screen.queryByTestId('name-form-save')
        expect(button).toBeInTheDocument()
    })
    test('Save button is not visible when form is not open', () => {
        render(<Provider store={store}><NameForm open={ false } handleSave={ () => {} } handleCancel={ () => {} } /></Provider>)
        const button = screen.queryByTestId('name-form-save')
        expect(button).not.toBeInTheDocument()
    })
    test('Save button is disabled by default', () => {
        render(<Provider store={store}><NameForm open={ true } handleSave={ () => {} } handleCancel={ () => {} } /></Provider>)
        const button = screen.queryByTestId('name-form-save')
        expect(button.disabled).toBe(true)
    })
})

describe('Name form is functional', () => {
    test('Typing in name input updates input value', async () => {
        const user = userEvent.setup()
        render(<Provider store={store}><NameForm open={ true } handleSave={ () => {} } handleCancel={ () => {} } /></Provider>)
        const input = screen.getByTestId('name-form-input')
        await user.type(input, 'a')
        expect(input.value).toBe('a')
    })
    test('Typing in name input enables save button', async () => {
        const user = userEvent.setup()
        render(<Provider store={store}><NameForm open={ true } handleSave={ () => {} } handleCancel={ () => {} } /></Provider>)
        const input = screen.getByTestId('name-form-input')
        const button = screen.getByTestId('name-form-save')
        await user.type(input, 'a')
        expect(button.disabled).toBe(false)
    })
    test('Clicking cancel button calls cancel handler', async () => {
        const user = userEvent.setup()
        const handleCancelMock = vi.fn()
        render(<Provider store={store}><NameForm open={ true } handleSave={ () => {} } handleCancel={ handleCancelMock } /></Provider>)
        const button = screen.getByTestId('name-form-cancel')
        await user.click(button)
        expect(handleCancelMock).toHaveBeenCalledTimes(1)
    })
    test('Clicking save button after typing in name input calls save handler', async () => {
        const user = userEvent.setup()
        const handleSaveMock = vi.fn(e => e.preventDefault())
        render(<Provider store={store}><NameForm open={ true } handleSave={ handleSaveMock } handleCancel={ () => {}  } /></Provider>)
        const input = screen.getByTestId('name-form-input')
        const button = screen.getByTestId('name-form-save')
        await user.type(input, 'a')
        await user.click(button)
        expect(handleSaveMock).toHaveBeenCalledTimes(1)
    })
})