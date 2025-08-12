import { Tooltip, IconButton } from '@mui/material'

const ToolButton = ({ toolName, currentTool, setTool, icon } ) => {
    const selected = currentTool === toolName
    return (
        <Tooltip title={ toolName } placement='top'>
            <IconButton 
                sx={{
                    border: '2px solid',
                    width: '50px',
                    height: '50px',
                    backgroundColor: selected ? '#000000' : '#ffffff'
                    }} 
                color={ selected ? 'primary' : 'default' }
                onClick={() => setTool(toolName)}
                >
                <img src={icon} style={selected ? {filter: 'invert(100%)', width: '100%', height: '100%'} : {}}/>
            </IconButton>
        </Tooltip>
    )
}

export default ToolButton