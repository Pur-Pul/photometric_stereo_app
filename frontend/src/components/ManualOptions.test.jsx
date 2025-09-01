import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import store from '../store'




import ManualOptions from './ManualOptions'

describe('Manual options renders.', () => {
    test('Dimensions description is visible.', () => {
        render(<Provider store={store}><ManualOptions width={100} height={100} setWidth={() => {}} setHeight={() => {}} setReady={() => {}}/></Provider>)
        const description = screen.queryByTestId('dimensions-description')
        expect(description).toBeInTheDocument() 
    })
    test('Width label is visible.', () => {
        render(<Provider store={store}><ManualOptions width={100} height={100} setWidth={() => {}} setHeight={() => {}} setReady={() => {}}/></Provider>)
        const label = screen.queryByTestId('manual-width-label')
        expect(label).toBeInTheDocument()
    })
    test('Height label is visible.', () => {
        render(<Provider store={store}><ManualOptions width={100} height={100} setWidth={() => {}} setHeight={() => {}} setReady={() => {}}/></Provider>)
        const label = screen.queryByTestId('manual-height-label')
        expect(label).toBeInTheDocument()
    })
    test('Width input is visible and has value 100.', () => {
        render(<Provider store={store}><ManualOptions width={100} height={100} setWidth={() => {}} setHeight={() => {}} setReady={() => {}}/></Provider>)
        const input = screen.queryByTestId('manual-width')
        expect(input).toBeInTheDocument()
        expect(input.value).toBe('100')
    })
    test('Height input is visible and has value 100.', () => {
        render(<Provider store={store}><ManualOptions width={100} height={100} setWidth={() => {}} setHeight={() => {}} setReady={() => {}}/></Provider>)
        const input = screen.queryByTestId('manual-height')
        expect(input).toBeInTheDocument() 
        expect(input.value).toBe('100')
    })
    test('Width label is bound to with input.', () => {
        render(<Provider store={store}><ManualOptions width={100} height={100} setWidth={() => {}} setHeight={() => {}} setReady={() => {}}/></Provider>)
        const label = screen.getByTestId('manual-width-label')
        const input = screen.getByTestId('manual-width')
        expect(label.getAttribute('for')).toBe(input.id)
    })
    test('Height label is bound to with input.', () => {
        render(<Provider store={store}><ManualOptions width={100} height={100} setWidth={() => {}} setHeight={() => {}} setReady={() => {}}/></Provider>)
        const label = screen.getByTestId('manual-height-label')
        const input = screen.getByTestId('manual-height')
        expect(label.getAttribute('for')).toBe(input.id)
    })
    test('By default setReady is called with true', () => {
        const mockedSetReady = vi.fn()
        render(<Provider store={store}><ManualOptions width={100} height={100} setWidth={() => {}} setHeight={() => {}} setReady={mockedSetReady}/></Provider>)
        expect(mockedSetReady.mock.calls.at(-1)[0]).toBe(true)
    })
})

describe('Manual options is functional.', () => {
    test('setWidth is called when width input recieves input..', async () => {
        const mockedSetWidth = vi.fn()
        render(<Provider store={store}><ManualOptions width={100} height={100} setWidth={mockedSetWidth} setHeight={() => {}} setReady={() => {}}/></Provider>)
        const user = userEvent.setup()
        const input = screen.getByTestId('manual-width')
        await user.type(input, '1')
        expect(mockedSetWidth).toHaveBeenCalledWith(1001)
    })
    test('setHeight is called when height input recieves input.', async () => {
        const mockedSetHeight = vi.fn()
        render(<Provider store={store}><ManualOptions width={100} height={100} setWidth={() => {}} setHeight={mockedSetHeight} setReady={() => {}}/></Provider>)
        const user = userEvent.setup()
        const input = screen.getByTestId('manual-height')
        await user.type(input, '1')
        expect(mockedSetHeight).toHaveBeenCalledWith(1001)
    })
    test('setReady is called with false when width is 0 or less', async () => {
        const mockedSetReady = vi.fn()
        render(<Provider store={store}><ManualOptions width={0} height={100} setWidth={() => {}} setHeight={() => {}} setReady={mockedSetReady}/></Provider>)
        expect(mockedSetReady.mock.calls.at(-1)[0]).toBe(false)
        mockedSetReady.mockClear()
        render(<Provider store={store}><ManualOptions width={-1} height={100} setWidth={() => {}} setHeight={() => {}} setReady={mockedSetReady}/></Provider>)
        expect(mockedSetReady.mock.calls.at(-1)[0]).toBe(false)
        mockedSetReady.mockClear()
        render(<Provider store={store}><ManualOptions width={-1000000} height={100} setWidth={() => {}} setHeight={() => {}} setReady={mockedSetReady}/></Provider>)
        expect(mockedSetReady.mock.calls.at(-1)[0]).toBe(false)
    })
    test('setReady is called with false when height is 0 or less', async () => {
        const mockedSetReady = vi.fn()
        render(<Provider store={store}><ManualOptions width={100} height={0} setWidth={() => {}} setHeight={() => {}} setReady={mockedSetReady}/></Provider>)
        expect(mockedSetReady.mock.calls.at(-1)[0]).toBe(false)
        mockedSetReady.mockClear()
        render(<Provider store={store}><ManualOptions width={100} height={-1} setWidth={() => {}} setHeight={() => {}} setReady={mockedSetReady}/></Provider>)
        expect(mockedSetReady.mock.calls.at(-1)[0]).toBe(false)
        mockedSetReady.mockClear()
        render(<Provider store={store}><ManualOptions width={100} height={-1000000} setWidth={() => {}} setHeight={() => {}} setReady={mockedSetReady}/></Provider>)
        expect(mockedSetReady.mock.calls.at(-1)[0]).toBe(false)
    })
})