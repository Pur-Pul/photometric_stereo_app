import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import store from '../store'

vi.mock('./SourceImage',    () => ({ default: vi.fn(({file, files}) => <mock-SourceImage data-testid={`photometric-source-${file.id}`}/>)}))
vi.mock('./Mask',           () => ({ default: vi.fn(() => <mock-Mask data-testid='photometric-mask' />)}))
vi.mock('./NameForm',       () => ({ default: vi.fn(() => <mock-NameForm data-testid='photometric-name-form'/>)}))

vi.mock(import('../reducers/normalMapReducer'), async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        generateNormalMap: vi.fn(() => () => {})
    }
})

vi.mock(import('../reducers/notificationReducer'), async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        notificationSet: vi.fn(() => () => {}),
        notificationRemove: vi.fn(() => () => {})
    }
})

const mockedLocation = vi.fn()
const mockedNavigate = vi.fn()
vi.mock(import('react-router-dom'), async (importOriginal) => {
    const actual = await importOriginal()
    return {...actual, useLocation: () => mockedLocation, useNavigate: () => mockedNavigate}
})


import PhotometricForm from './PhotometricForm'

describe('Photometric form renders.', () => {
    window.URL.createObjectURL = vi.fn()
    afterEach(() => {
        vi.clearAllMocks()
    })
    test('Title is visible.', () => {
        render(<Provider store={store}><PhotometricForm /></Provider>)
        const title = screen.queryByTestId('photometric-title')
        expect(title).toBeInTheDocument()
    })
    test('File upload is visible', () => {
        render(<Provider store={store}><PhotometricForm /></Provider>)
        const input = screen.queryByTestId('photometric-file-upload')
        expect(input).toBeInTheDocument()
    })
    test('Submit button is visible', () => {
        render(<Provider store={store}><PhotometricForm /></Provider>)
        const button = screen.queryByTestId('photometric-submit')
        expect(button).toBeInTheDocument()
    })
    test('Submit button is disabled by default.', () => {
        render(<Provider store={store}><PhotometricForm /></Provider>)
        const button = screen.queryByTestId('photometric-submit')
        expect(button.disabled).toBe(true)
    })
    test('Mask is visible.', () => {
        render(<Provider store={store}><PhotometricForm /></Provider>)
        const mask = screen.queryByTestId('photometric-mask')
        expect(mask).toBeInTheDocument()
    })
    test('NameForm is visible.', () => {
        render(<Provider store={store}><PhotometricForm /></Provider>)
        const form = screen.queryByTestId('photometric-name-form')
        expect(form).toBeInTheDocument()
    })
})

describe('Photometric form is functional', () => {
    const dimensions = []
    Object.defineProperty(window.Image.prototype, 'src', {
        set (src) {
            this._src = src
            setTimeout(() => {
                const {width, height} = dimensions.length > 0 ? dimensions.pop() : { width: 100, height: 100 }
                if (this.onload) {
                    this.width = width
                    this.height = height
                    this.onload()
                }
            }, 0) 
        },
        get () {
            return this._src
        }
    })
    afterEach(() => {
        vi.clearAllMocks()
        dimensions.length = 0
    })
    test('When a file is uploaded a SourceImage becomes visible.', async () => {
        const user = userEvent.setup()
        const { rerender } = render(<Provider store={store}><PhotometricForm /></Provider>)
        const input = screen.getByTestId('photometric-file-upload')
        const file = new File(['test'], 'test.png', {type: 'image/png'})
        await user.upload(input, file)
        rerender(<Provider store={store}><PhotometricForm /></Provider>)
        const source = await screen.findByTestId('photometric-source-0')
        expect(source).toBeInTheDocument()
    })
    test('When multiple files are uploaded multiple SourceImages becomes visible.', async () => {
        const user = userEvent.setup()
        const { rerender } = render(<Provider store={store}><PhotometricForm /></Provider>)
        const input = screen.getByTestId('photometric-file-upload')
        const files = [
            new File(['test0'], 'test0.png', {type: 'image/png'}),
            new File(['test1'], 'test1.png', {type: 'image/png'}),
            new File(['test2'], 'test2.png', {type: 'image/png'}),
            new File(['test3'], 'test3.png', {type: 'image/png'}),
            new File(['test4'], 'test4.png', {type: 'image/png'})
        ]
        await user.upload(input, files)
        rerender(<Provider store={store}><PhotometricForm /></Provider>)
        const source0 = screen.queryByTestId('photometric-source-0')
        const source1 = screen.queryByTestId('photometric-source-1')
        const source2 = screen.queryByTestId('photometric-source-2')
        const source3 = screen.queryByTestId('photometric-source-3')
        const source4 = screen.queryByTestId('photometric-source-4')
        expect(source0).toBeInTheDocument()
        expect(source1).toBeInTheDocument()
        expect(source2).toBeInTheDocument()
        expect(source3).toBeInTheDocument()
        expect(source4).toBeInTheDocument()
    })
    test('When only one image file is uploaded, the submit button is disabled', async () => {
        const user = userEvent.setup()
        dimensions.push({width: 200, height: 200})
        const { rerender } = render(<Provider store={store}><PhotometricForm /></Provider>)
        const input = screen.getByTestId('photometric-file-upload')
        const files = [
            new File(['test0'], 'test0.png', {type: 'image/png'})
        ]
        vi.clearAllMocks()
        await user.upload(input, files)
        rerender(<Provider store={store}><PhotometricForm /></Provider>)
        
        const button = screen.queryByTestId('photometric-submit')
        expect(button.disabled).toBe(true)
    })
    test('When multiple image files with different resolutions are uploaded, the submit button is disabled.', async () => {
        const user = userEvent.setup()
        dimensions.push({width: 200, height: 200})
        dimensions.push({width: 100, height: 100})
        const { rerender } = render(<Provider store={store}><PhotometricForm /></Provider>)
        const input = screen.getByTestId('photometric-file-upload')
        const files = [
            new File(['test0'], 'test0.png', {type: 'image/png'}),
            new File(['test1'], 'test1.png', {type: 'image/png'})
        ]
        vi.clearAllMocks()
        await user.upload(input, files)
        rerender(<Provider store={store}><PhotometricForm /></Provider>)
        
        const button = screen.queryByTestId('photometric-submit')
        expect(button.disabled).toBe(true)
    })
    test('When multiple image files of different file formats are uploaded, the submit button is disabled.', async () => {
        const user = userEvent.setup()
        const { rerender } = render(<Provider store={store}><PhotometricForm /></Provider>)
        const input = screen.getByTestId('photometric-file-upload')
        const files = [
            new File(['test0'], 'test0.jpg', {type: 'image/jpg'}),
            new File(['test1'], 'test1.png', {type: 'image/png'})
        ]
        vi.clearAllMocks()
        await user.upload(input, files)
        rerender(<Provider store={store}><PhotometricForm /></Provider>)
        const button = screen.queryByTestId('photometric-submit')
        expect(button.disabled).toBe(true)
    })
    test('When multiple image files of the same dimensions and fileformat are upload, the submit button is enabled', async () => {
        const user = userEvent.setup()
        const { rerender } = render(<Provider store={store}><PhotometricForm /></Provider>)
        const input = screen.getByTestId('photometric-file-upload')
        const files = [
            new File(['test0'], 'test0.png', {type: 'image/png'}),
            new File(['test1'], 'test1.png', {type: 'image/png'})
        ]
        vi.clearAllMocks()
        await user.upload(input, files)
        rerender(<Provider store={store}><PhotometricForm /></Provider>)
        const button = screen.queryByTestId('photometric-submit')
        expect(button.disabled).toBe(false)
    })
    test('Clicking submit after uploading files renders the nameForm with open prop true.', async () => {
        const user = userEvent.setup()
        
        render(<Provider store={store}><PhotometricForm /></Provider>)
        const input = screen.getByTestId('photometric-file-upload')
        const files = [
            new File(['test0'], 'test0.png', {type: 'image/png'}),
            new File(['test1'], 'test1.png', {type: 'image/png'})
        ]
        
        await user.upload(input, files)   
        const button = screen.getByTestId('photometric-submit')
        vi.clearAllMocks()
        
        const NameForm = await import('./NameForm')
        await user.click(button)
        expect(NameForm.default).toHaveBeenCalledTimes(1)
        expect(NameForm.default.mock.calls.at(-1)[0].open).toBe(true)
    })
})
