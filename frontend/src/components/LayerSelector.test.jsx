import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import store from '../store'




import LayerSelector from './LayerSelector'

describe('layer selector renders.', () => {
    test('layer selector title is visible', () => {
        render(<Provider store={store}><LayerSelector layers={[]} selectedLayer={0} setSelectedLayer={() => {}} addLayer={() => {}} removeLayer={() => {}} toggleLayer={ () => {} }/></Provider>)
        const title = screen.queryByTestId('layer-selector-title')
        expect(title).toBeInTheDocument()
    })
    test('layer selector add button is visible', () => {
        render(<Provider store={store}><LayerSelector layers={[]} selectedLayer={0} setSelectedLayer={() => {}} addLayer={() => {}} removeLayer={() => {}} toggleLayer={ () => {} }/></Provider>)
        const button = screen.queryByTestId('layer-add')
        expect(button).toBeInTheDocument()
    })
    
    test('layer selector layer button is not visible when no layers are provided.', () => {
        render(<Provider store={store}><LayerSelector layers={[]} selectedLayer={0} setSelectedLayer={() => {}} addLayer={() => {}} removeLayer={() => {}} toggleLayer={ () => {} }/></Provider>)
        const button = screen.queryByTestId('layer-0-select-button')
        expect(button).not.toBeInTheDocument()
    })
    test('layer select button is visible when one layer is provided.', () => {
        render(<Provider store={store}><LayerSelector layers={[{}]} selectedLayer={0} setSelectedLayer={() => {}} addLayer={() => {}} removeLayer={() => {}} toggleLayer={ () => {} }/></Provider>)
        const button = screen.queryByTestId('layer-0-select-button')
        expect(button).toBeInTheDocument()
    })
    test('multiple layer select buttons are visible when multiple layer are provided.', () => {
        render(<Provider store={store}><LayerSelector layers={[{}, {}, {}, {}, {}]} selectedLayer={0} setSelectedLayer={() => {}} addLayer={() => {}} removeLayer={() => {}} toggleLayer={ () => {} }/></Provider>)
        const button0 = screen.queryByTestId('layer-0-select-button')
        const button1 = screen.queryByTestId('layer-1-select-button')
        const button2 = screen.queryByTestId('layer-2-select-button')
        const button3 = screen.queryByTestId('layer-3-select-button')
        const button4 = screen.queryByTestId('layer-4-select-button')
        expect(button0).toBeInTheDocument()
        expect(button1).toBeInTheDocument()
        expect(button2).toBeInTheDocument()
        expect(button3).toBeInTheDocument()
        expect(button4).toBeInTheDocument()
    })

    test('layer hide button is not visible when no layers are provided.', () => {
        render(<Provider store={store}><LayerSelector layers={[]} selectedLayer={0} setSelectedLayer={() => {}} addLayer={() => {}} removeLayer={() => {}} toggleLayer={ () => {} }/></Provider>)
        const button = screen.queryByTestId('layer-0-hide-button')
        expect(button).not.toBeInTheDocument()
    })
    test('layer hide button is visible when layers are provided.', () => {
        render(<Provider store={store}><LayerSelector layers={[{}]} selectedLayer={0} setSelectedLayer={() => {}} addLayer={() => {}} removeLayer={() => {}} toggleLayer={ () => {} }/></Provider>)
        const button = screen.queryByTestId('layer-0-hide-button')
        expect(button).toBeInTheDocument()
    })
    test('multiple layer hide buttons are visible when multiple layer are provided.', () => {
        render(<Provider store={store}><LayerSelector layers={[{}, {}, {}, {}, {}]} selectedLayer={0} setSelectedLayer={() => {}} addLayer={() => {}} removeLayer={() => {}} toggleLayer={ () => {} }/></Provider>)
        const button0 = screen.queryByTestId('layer-0-hide-button')
        const button1 = screen.queryByTestId('layer-1-hide-button')
        const button2 = screen.queryByTestId('layer-2-hide-button')
        const button3 = screen.queryByTestId('layer-3-hide-button')
        const button4 = screen.queryByTestId('layer-4-hide-button')
        expect(button0).toBeInTheDocument()
        expect(button1).toBeInTheDocument()
        expect(button2).toBeInTheDocument()
        expect(button3).toBeInTheDocument()
        expect(button4).toBeInTheDocument()
    })

    test('layer delete button is not visible when no layers are provided.', () => {
        render(<Provider store={store}><LayerSelector layers={[]} selectedLayer={0} setSelectedLayer={() => {}} addLayer={() => {}} removeLayer={() => {}} toggleLayer={ () => {} }/></Provider>)
        const button = screen.queryByTestId('layer-0-delete-button')
        expect(button).not.toBeInTheDocument()
    })
    test('layer delete button is visible when layers are provided.', () => {
        render(<Provider store={store}><LayerSelector layers={[{}]} selectedLayer={0} setSelectedLayer={() => {}} addLayer={() => {}} removeLayer={() => {}} toggleLayer={ () => {} }/></Provider>)
        const button = screen.queryByTestId('layer-0-delete-button')
        expect(button).toBeInTheDocument()
    })
    test('multiple layer delete buttons are visible when multiple layer are provided.', () => {
        render(<Provider store={store}><LayerSelector layers={[{}, {}, {}, {}, {}]} selectedLayer={0} setSelectedLayer={() => {}} addLayer={() => {}} removeLayer={() => {}} toggleLayer={ () => {} }/></Provider>)
        const button0 = screen.queryByTestId('layer-0-delete-button')
        const button1 = screen.queryByTestId('layer-1-delete-button')
        const button2 = screen.queryByTestId('layer-2-delete-button')
        const button3 = screen.queryByTestId('layer-3-delete-button')
        const button4 = screen.queryByTestId('layer-4-delete-button')
        expect(button0).toBeInTheDocument()
        expect(button1).toBeInTheDocument()
        expect(button2).toBeInTheDocument()
        expect(button3).toBeInTheDocument()
        expect(button4).toBeInTheDocument()
    })
})

describe('layer selector is functional', () => {
    test('clicking layer add button calls addLayer.', async () => {
        const user = userEvent.setup()
        const addLayerMock = vi.fn()
        render(<Provider store={store}><LayerSelector layers={[]} selectedLayer={0} setSelectedLayer={() => {}} addLayer={addLayerMock} removeLayer={() => {}} toggleLayer={ () => {} }/></Provider>)
        const button = screen.getByTestId('layer-add')
        await user.click(button)
        expect(addLayerMock).toHaveBeenCalledTimes(1)
    })
    test('clicking layer select button calls setSelectedLayer with corresponding index', async () => {
        const user = userEvent.setup()
        const setSelectedLayerMock = vi.fn()
        render(<Provider store={store}><LayerSelector layers={[{}, {}, {}]} selectedLayer={0} setSelectedLayer={setSelectedLayerMock} addLayer={() => {}} removeLayer={() => {}} toggleLayer={ () => {} }/></Provider>)
        const button0 = screen.getByTestId('layer-0-select-button')
        await user.click(button0)
        expect(setSelectedLayerMock).toHaveBeenCalledTimes(1)
        expect(setSelectedLayerMock).toHaveBeenCalledWith(0)
        const button2 = screen.getByTestId('layer-2-select-button')
        await user.click(button2)
        expect(setSelectedLayerMock).toHaveBeenCalledTimes(2)
        expect(setSelectedLayerMock).toHaveBeenCalledWith(2)
        const button1 = screen.getByTestId('layer-1-select-button')
        await user.click(button1)
        expect(setSelectedLayerMock).toHaveBeenCalledTimes(3)
        expect(setSelectedLayerMock).toHaveBeenCalledWith(1)
    })
    test('clicking layer hide button calls toggleLayer with corresponding index.', async () => {
        const user = userEvent.setup()
        const toggleLayerMock = vi.fn()
        render(<Provider store={store}><LayerSelector layers={[{}, {}, {}]} selectedLayer={0} setSelectedLayer={() => {}} addLayer={() => {}} removeLayer={() => {}} toggleLayer={ toggleLayerMock }/></Provider>)
        const button0 = screen.getByTestId('layer-0-hide-button')
        const button1 = screen.getByTestId('layer-1-hide-button')
        const button2 = screen.getByTestId('layer-2-hide-button')
        await user.click(button0)
        expect(toggleLayerMock).toHaveBeenCalledTimes(1)
        expect(toggleLayerMock).toHaveBeenCalledWith(0)
        await user.click(button2)
        expect(toggleLayerMock).toHaveBeenCalledTimes(2)
        expect(toggleLayerMock).toHaveBeenCalledWith(2)
        await user.click(button1)
        expect(toggleLayerMock).toHaveBeenCalledTimes(3)
        expect(toggleLayerMock).toHaveBeenCalledWith(1)
    })
    test('clicking layer delete button calls toggleLayer with corresponding index.', async () => {
        const user = userEvent.setup()
        const removeLayerMock = vi.fn()
        render(<Provider store={store}><LayerSelector layers={[{}, {}, {}]} selectedLayer={0} setSelectedLayer={() => {}} addLayer={() => {}} removeLayer={ removeLayerMock } toggleLayer={ () => {} }/></Provider>)
        const button0 = screen.getByTestId('layer-0-delete-button')
        const button1 = screen.getByTestId('layer-1-delete-button')
        const button2 = screen.getByTestId('layer-2-delete-button')
        await user.click(button0)
        expect(removeLayerMock).toHaveBeenCalledTimes(1)
        expect(removeLayerMock).toHaveBeenCalledWith(0)
        await user.click(button2)
        expect(removeLayerMock).toHaveBeenCalledTimes(2)
        expect(removeLayerMock).toHaveBeenCalledWith(2)
        await user.click(button1)
        expect(removeLayerMock).toHaveBeenCalledTimes(3)
        expect(removeLayerMock).toHaveBeenCalledWith(1)
    })
})