import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import store from '../store'
import { useEffect } from 'react'

vi.mock('./ManualOptions', () => {
    return { default: vi.fn(({setReady, setWidth, setHeight}) => {
        useEffect(() => {
            setReady(true)
            setWidth(100)
            setHeight(100)
        }, [])
        return <mock-ManualOptions data-testid='mocked-manual-options' />
    })}
})

vi.mock('./UploadOptions', () => {
    return { default: vi.fn(({setReady}) => {
        useEffect(() => {
            setReady(true)
        }, [])
        
        return <mock-UploadOptions data-testid='mocked-upload-options' />
    })}
})

vi.mock(import('../reducers/normalMapReducer'), async (importOriginal) => {
    const actual = await importOriginal()
    return {...actual, performCreate: vi.fn(() => () => {}) }
})

const mockedNavigate = vi.fn()
vi.mock(import('react-router-dom'), async (importOriginal) => {
    const actual = await importOriginal()
    return {...actual, useNavigate: () => mockedNavigate }
})

import NewNormalMapForm from './NewNormalMapForm'

describe('New normal map form renders.', () => {
    test('If open prop is false the form is not rendered.', () => {
        render(<Provider store={store}><NewNormalMapForm open={false} setOpen={() => {}}/></Provider>)
        const form = screen.queryByTestId('normal-map-form')
        expect(form).not.toBeInTheDocument()
    })
    test('If open prop is true the form is rendered.', () => {
        render(<Provider store={store}><NewNormalMapForm open={true} setOpen={() => {}}/></Provider>)
        const form = screen.queryByTestId('normal-map-form')
        expect(form).toBeInTheDocument() 
    })
    test('Form contains description.', () => {
        render(<Provider store={store}><NewNormalMapForm open={true} setOpen={() => {}}/></Provider>)
        const description = screen.queryByTestId('form-description')
        expect(description).toBeInTheDocument() 
    })
    test('Form contains description.', () => {
        render(<Provider store={store}><NewNormalMapForm open={true} setOpen={() => {}}/></Provider>)
        const description = screen.queryByTestId('form-description')
        expect(description).toBeInTheDocument() 
    })
    test('Form contains option button group.', () => {
        render(<Provider store={store}><NewNormalMapForm open={true} setOpen={() => {}}/></Provider>)
        const group = screen.queryByTestId('form-option-buttons')
        expect(group).toBeInTheDocument() 
    })
    test('Form contains photometric button..', () => {
        render(<Provider store={store}><NewNormalMapForm open={true} setOpen={() => {}}/></Provider>)
        const button = screen.queryByTestId('button-photometric')
        expect(button).toBeInTheDocument() 
    })
    test('Form contains manual button..', () => {
        render(<Provider store={store}><NewNormalMapForm open={true} setOpen={() => {}}/></Provider>)
        const button = screen.queryByTestId('button-manual')
        expect(button).toBeInTheDocument() 
    })
    test('Form contains upload button..', () => {
        render(<Provider store={store}><NewNormalMapForm open={true} setOpen={() => {}}/></Provider>)
        const button = screen.queryByTestId('button-upload')
        expect(button).toBeInTheDocument()
    })
    test('By default manual options are not rendered.', () => {
        render(<Provider store={store}><NewNormalMapForm open={true} setOpen={() => {}}/></Provider>)
        const options = screen.queryByTestId('mocked-manual-options')
        expect(options).not.toBeInTheDocument()
    })
    test('By default upload options are not rendered.', () => {
        render(<Provider store={store}><NewNormalMapForm open={true} setOpen={() => {}}/></Provider>)
        const options = screen.queryByTestId('mocked-upload-options')
        expect(options).not.toBeInTheDocument()
    })
    test('Cancel button is rendered.', () => {
        render(<Provider store={store}><NewNormalMapForm open={true} setOpen={() => {}}/></Provider>)
        const button = screen.queryByTestId('form-cancel')
        expect(button).toBeInTheDocument()
    })
    test('Continue button is rendered.', () => {
        render(<Provider store={store}><NewNormalMapForm open={true} setOpen={() => {}}/></Provider>)
        const button = screen.queryByTestId('form-continue')
        expect(button).toBeInTheDocument()
    })
    test('By default continue button is disabled.', () => {
        render(<Provider store={store}><NewNormalMapForm open={true} setOpen={() => {}}/></Provider>)
        const button = screen.getByTestId('form-continue')
        expect(button).toHaveAttribute('disabled')
    })
})

describe('New normal map form is functional.', () => {
    window.URL.createObjectURL = vi.fn()
    afterEach(() => {
        vi.clearAllMocks()
    })
    test('setOpen handler is called with false when cancel is clicked.', async () => {
        const user = userEvent.setup()
        const setOpen = vi.fn()
        render(<Provider store={store}><NewNormalMapForm open={true} setOpen={setOpen}/></Provider>)
        const button = screen.getByTestId('form-cancel')
        await user.click(button)
        expect(setOpen).toHaveBeenCalledWith(false)
    })
    test('Continue button is enabled after clicking potometric button.', async() => {
        const user = userEvent.setup()
        render(<Provider store={store}><NewNormalMapForm open={true} setOpen={() => {}}/></Provider>)
        const button = screen.getByTestId('button-photometric')
        await user.click(button)
        expect(screen.getByTestId('form-continue')).not.toHaveAttribute('disabled')
    })
    test('Continue button is enabled after clicking manual button.', async() => {
        const user = userEvent.setup()
        render(<Provider store={store}><NewNormalMapForm open={true} setOpen={() => {}}/></Provider>)
        const button = screen.getByTestId('button-manual')
        await user.click(button)
        expect(screen.getByTestId('form-continue')).not.toHaveAttribute('disabled')
    })
    test('Manual options are visible after clicking manual button.', async() => {
        const user = userEvent.setup()
        render(<Provider store={store}><NewNormalMapForm open={true} setOpen={() => {}}/></Provider>)
        const button = screen.getByTestId('button-manual')
        await user.click(button)
        expect(screen.getByTestId('mocked-manual-options')).toBeInTheDocument()
    })
    test('Continue button is enabled when a file is uploaded.', async () => {
        const user = userEvent.setup()
        render(<Provider store={store}><NewNormalMapForm open={true} setOpen={() => {}}/></Provider>)
        const fileUpload = screen.getByTestId('file-upload')
        const file = new File(['test'], 'test.png', {type: 'image/png'})
        await user.upload(fileUpload, file)
        expect(screen.getByTestId('form-continue')).not.toHaveAttribute('disabled')
    })
    test('Upload options are visible after file upload.', async() => {
        const user = userEvent.setup()
        render(<Provider store={store}><NewNormalMapForm open={true} setOpen={() => {}}/></Provider>)
        const fileUpload = screen.getByTestId('file-upload')
        const file = new File(['test'], 'test.png', {type: 'image/png'})
        await user.upload(fileUpload, file)
        expect(screen.getByTestId('mocked-upload-options')).toBeInTheDocument()
    })
    test('Clicking continue after clicking photometric calls navigate with \'/normal_map/photostereo\'', async () => {
        const user = userEvent.setup()
        render(<Provider store={store}><NewNormalMapForm open={true} setOpen={() => {}}/></Provider>)
        await user.click(screen.getByTestId('button-photometric'))
        await user.click(screen.getByTestId('form-continue'))
        expect(mockedNavigate).toHaveBeenCalledWith('/normal_map/photostereo')
    })
    test('Clicking continue after clicking manual calls navigate with \'/normal_map/100/100\'', async () => {
        const user = userEvent.setup()
        render(<Provider store={store}><NewNormalMapForm open={true} setOpen={() => {}}/></Provider>)
        await user.click(screen.getByTestId('button-manual'))
        await user.click(screen.getByTestId('form-continue'))
        expect(mockedNavigate).toHaveBeenCalledWith('/normal_map/manual/100/100')
    })
    test('Clicking continue after uploading calls performCreate with file, name and navigate', async () => {
        const user = userEvent.setup()
        render(<Provider store={store}><NewNormalMapForm open={true} setOpen={() => {}}/></Provider>)
        const fileUpload = screen.getByTestId('file-upload')
        const file = new File(['test'], 'test.png', {type: 'image/png'})
        await user.upload(fileUpload, file)
        await user.click(screen.getByTestId('form-continue'))
        const normalMapReducer = await import('../reducers/normalMapReducer')
        expect(normalMapReducer.performCreate.mock.calls.at(-1)[0][0]).toBe(file)
        expect(normalMapReducer.performCreate.mock.calls.at(-1)[1]).toBe('test')
        expect(normalMapReducer.performCreate.mock.calls.at(-1)[2]).toBe(mockedNavigate)
    })
})