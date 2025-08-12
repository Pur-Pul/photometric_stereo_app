import { Dialog, DialogTitle, DialogActions, Button, IconButton, Grid } from '@mui/material'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import ToolButton from './ToolButton'
import normal_sphere from '../static/normal_sphere.png'

const Shape = ({shape}) => {
    return (
        <IconButton>
            <img src={shape}/>
        </IconButton>
    )
}

const ShapeTool = ({currentTool, setTool}) => {
    const [open, setOpen] = useState(false)
    const [selectedShape, setSelectedShape] = useState(null)
    const [shapes, setShapes] = useState([normal_sphere])
    const normalMaps = useSelector((state) => state.normalMaps)

    useEffect(() => {
        console.log(normalMaps)
    }, [currentTool])

    return (
        <div>
            <div onClick={() => setOpen(true)}>
                <ToolButton toolName='shape' currentTool={currentTool} setTool={setTool} icon={'shape'}/>
            </div>
            <Dialog open={open} closeAfterTransition={false}>
                <DialogTitle>Select a shape</DialogTitle>
                <Grid container>
                    {shapes.map((shape) => <Shape key={shape} shape={shape}/>)}
                </Grid>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button>Select</Button>
                </DialogActions>
            </Dialog>
        </div>
        
    )
}

export default ShapeTool