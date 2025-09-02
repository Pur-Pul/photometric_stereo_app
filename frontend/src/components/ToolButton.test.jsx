import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Provider } from 'react-redux'
import store from '../store'




import ToolButton from './ToolButton'

describe('Tool button renders.', () => {
    test('Title is not visible by default.', () => {
        render(<ToolButton toolName={'testtool'} currentTool={{name: 'firsttool'}} setTool={() => {}} icon={'testicon'} />)
        const title = screen.queryByTestId('tool-title')
        expect(title).not.toBeInTheDocument()
    })
    test('Button is visible.', () => {
        render(<ToolButton toolName={'testtool'} currentTool={{name: 'firsttool'}} setTool={() => {}} icon={'testicon'} />)
        const button = screen.queryByTestId('select-button')
        expect(button).toBeInTheDocument()
    })
    test('Icon is visible.', () => {
        render(<ToolButton toolName={'testtool'} currentTool={{name: 'firsttool'}} setTool={() => {}} icon={'testicon'} />)
        const icon = screen.queryByTestId('tool-icon')
        expect(icon).toBeInTheDocument()
    })
})

describe('Tool button is functional.', () => {
    test('Title becomes visible when mousing over tool button.', async () => {
        const user = userEvent.setup()
        render(<ToolButton toolName={'secondtool'} currentTool={{name: 'firsttool'}} setTool={() => {}} icon={'testicon'} />)
        const button = screen.getByTestId('select-button')
        await user.hover(button)
        const title = await screen.findByTestId('tool-title')
        expect(title).toBeInTheDocument()
    })
    test('Clicking select button calls setTool with the tool assigned to the button.', async () => {
        const setToolMock = vi.fn()
        const user = userEvent.setup()
        render(<ToolButton toolName={'secondtool'} currentTool={{name: 'firsttool'}} setTool={setToolMock} icon={'testicon'} />)

        const button = screen.getByTestId('select-button')
        await user.click(button)
        expect(setToolMock).toHaveBeenCalledTimes(1)
        expect(setToolMock.mock.calls[0][0].name).toBe('secondtool')
    })
    test('Clicking select button a second time calls setTool with the previous tool.', async () => {
        const setToolMock = vi.fn()
        const user = userEvent.setup()
        const { rerender } = await render(<ToolButton toolName={'secondtool'} currentTool={{name: 'firsttool'}} setTool={setToolMock} icon={'testicon'} />)

        const button = screen.getByTestId('select-button')
        await user.click(button)
        rerender(<ToolButton toolName={'secondtool'} currentTool={{name: 'secondtool'}} setTool={setToolMock} icon={'testicon'} />)
        await user.click(button)
        
        expect(setToolMock).toHaveBeenCalledTimes(2)
        expect(setToolMock.mock.calls[1][0].name).toBe('firsttool')
    })
})