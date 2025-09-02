import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import store from '../store'




import UploadOptions from './UploadOptions'

describe('Upload options renders.', () => {
    test('Upload name field is visible.', () => {
        render(<Provider store={store}><UploadOptions normalMap={{ src: 'test' }} name={'test'} setName={() => {}} setReady={() => {}} iconBlob={{}} setIconBlob={() => {}} /></Provider>)
        const field = screen.queryByTestId('upload-name')
        expect(field).toBeInTheDocument()
    })
    test('Uploaded image is visible.', () => {
        render(<Provider store={store}><UploadOptions normalMap={{ src: 'test' }} name={'test'} setName={() => {}} setReady={() => {}} iconBlob={{}} setIconBlob={() => {}} /></Provider>)
        const image = screen.queryByTestId('upload-image')
        
        expect(image).toBeInTheDocument()
        expect(image.getAttribute('src')).toBe('test')
    })
    test('set ready is called with true by default.', () => {
        const mockedSetReady = vi.fn()
        render(<Provider store={store}><UploadOptions normalMap={{ src: 'test' }} name={'test'} setName={() => {}} setReady={mockedSetReady} iconBlob={{}} setIconBlob={() => {}} /></Provider>)
        expect(mockedSetReady.mock.calls.at(-1)[0]).toBe(true)
    })
    test('set ready is called with false if name is empty.', () => {
        const mockedSetReady = vi.fn()
        render(<Provider store={store}><UploadOptions normalMap={{ src: 'test' }} name={''} setName={() => {}} setReady={mockedSetReady} iconBlob={{}} setIconBlob={() => {}} /></Provider>)
        expect(mockedSetReady.mock.calls.at(-1)[0]).toBe(false)
    })
    test('set ready is called with false if iconBlob is null or undefined.', () => {
        const mockedSetReady = vi.fn()
        render(<Provider store={store}><UploadOptions normalMap={{ src: 'test' }} name={'test'} setName={() => {}} setReady={mockedSetReady} iconBlob={null} setIconBlob={() => {}} /></Provider>)
        expect(mockedSetReady.mock.calls.at(-1)[0]).toBe(false)
        cleanup()
        render(<Provider store={store}><UploadOptions normalMap={{ src: 'test' }} name={'test'} setName={() => {}} setReady={mockedSetReady} iconBlob={undefined} setIconBlob={() => {}} /></Provider>)
        expect(mockedSetReady.mock.calls.at(-1)[0]).toBe(false)
    })
})

describe('Upload options is functional.', () => {
    test('Typing in name field calls setName', async () => {
        const user = userEvent.setup()
        const mockedSetName = vi.fn()
        render(<Provider store={store}><UploadOptions normalMap={{ src: 'test' }} name={'test'} setName={mockedSetName} setReady={() => {}} iconBlob={{}} setIconBlob={() => {}} /></Provider>)
        const field = screen.getByTestId('upload-name')
        await user.type(field, 'a')
        expect(mockedSetName).toHaveBeenCalledTimes(1)
        expect(mockedSetName).toHaveBeenCalledWith('testa')
    })
})
