import { Tooltip, IconButton } from '@mui/material'
import { useState, useEffect } from 'react'

const ToolButton = ({ toolName, currentTool, setTool, icon } ) => {
    const [previousTool, setPreviousTool] = useState(null)
    const [selected, setSelected] = useState(false)
    useEffect(() => {
        const selected = currentTool.name === toolName
        setSelected(selected)
        if (!selected) { setPreviousTool(null) }
    }, [currentTool, toolName])
    return (
        <div data-testid='tool-button'>
            <Tooltip title={ toolName } placement='top' slotProps={{ popper: { 'data-testid': 'tool-title' } }}>
                <IconButton
                    data-testid='select-button'
                    sx={{
                        border: '2px solid',
                        width: '50px',
                        height: '50px',
                        backgroundColor: selected ? '#000000' : '#ffffff'
                    }}
                    color={ selected ? 'primary' : 'default' }
                    onClick={() => {
                        if (selected && previousTool) {
                            setTool(previousTool)
                            setPreviousTool(null)
                        } else {
                            setPreviousTool(currentTool)
                            setTool({ name: toolName })
                        }
                    }}
                >
                    <img data-testid='tool-icon' src={icon} style={selected ? { filter: 'invert(100%)', width: '100%', height: '100%' } : {}}/>
                </IconButton>
            </Tooltip>
        </div>
    )
}

export default ToolButton