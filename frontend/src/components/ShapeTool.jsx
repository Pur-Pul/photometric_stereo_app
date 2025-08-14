import { Dialog, DialogTitle, DialogActions, Button, IconButton, Grid } from '@mui/material'
import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import ToolButton from './ToolButton'
import normal_sphere from '../static/normal_sphere.png'
import normal_sphere32 from '../static/normal_sphere32.png'
import imageService from '../services/images'

const getSource = async (layers) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    for (var i = 0; i < layers.length; i++) {
        console.log(layers[i])
        const blob = await imageService.getFile(layers[i].id)
        const image = new Image()
        image.src = URL.createObjectURL(blob)
        await image.decode()
        if (i === 0) {
            canvas.width = image.width
            canvas.height = image.height
        }
        
        ctx.drawImage(image, 0, 0, image.width, image.height)
    }
    return canvas.toDataURL()
}

const Shape = ({shape, selectedShape, setSelectedShape}) => {
    const handleSelect = async () => {
        if (!shape.src) {
            const src = await getSource(shape.layers)
            setSelectedShape({...shape, src})
        } else {
            setSelectedShape(shape)
        }
    }
    return (
        <div>
            <IconButton onClick={handleSelect}>
                { shape.icon 
                    ? <img src={ shape.icon.src }/>
                    : 'no icon'
                }
            </IconButton>
        </div>
    )
}

const ShapeTool = ({currentTool, setTool}) => {
    const [open, setOpen] = useState(false)
    const [selectedShape, setSelectedShape] = useState(null)
    const defaultShapes = [{ icon: { src: normal_sphere32 }, src: normal_sphere }]
    const [shapes, setShapes] = useState(defaultShapes)
    const normalMaps = useSelector((state) => state.normalMaps)

    useEffect(() => {
        const shapes = [...defaultShapes]
        for (var i = 0; i < normalMaps.length; i++) {
            console.log(normalMaps[i])
            if (!normalMaps[i].status === 'done') { continue }
            shapes.push(normalMaps[i])
        }
        setShapes(shapes)
    }, [currentTool])

    const handleSelect = () => {
        setTool({name: 'shape', shape: selectedShape})
        setOpen(false)
    }
    console.log(selectedShape)
    return (
        <div>
            <div onClick={() => setOpen(true)}>
                <ToolButton toolName='shape' currentTool={currentTool} setTool={setTool} icon={selectedShape && selectedShape.icon ? selectedShape.icon.src : 'none'}/>
            </div>
            <Dialog open={open} closeAfterTransition={false}>
                <DialogTitle>Select a shape</DialogTitle>
                <Grid container>
                    {shapes.map((shape, index) => <Shape key={index} shape={shape} selectedShape={selectedShape} setSelectedShape={setSelectedShape}/>)}
                </Grid>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSelect}>Select</Button>
                </DialogActions>
            </Dialog>
        </div>
        
    )
}

export default ShapeTool