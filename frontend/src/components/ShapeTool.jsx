import { Dialog, DialogTitle, DialogActions, Button, IconButton, Grid } from '@mui/material'
import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import ToolButton from './ToolButton'
import normal_sphere from '../static/normal_sphere.png'
import normal_sphere32 from '../static/normal_sphere32.png'
import imageService from '../services/images'

const blackToTransparent = async (src) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    const image = new Image()
    image.src = src
    await image.decode()

    canvas.width = image.width
    canvas.height = image.height
    ctx.drawImage(image, 0, 0, image.width, image.height)
    const srcData = ctx.getImageData(0, 0, image.width, image.height).data
    const outData = new Uint8ClampedArray(srcData.length)
    for (var i = 0; i < srcData.length; i += 4) {
        const red = srcData[i]
        const green = srcData[i+1]
        const blue = srcData[i+2]
        const alpha = srcData[i+3]
        outData[i] = red
        outData[i+1] = green
        outData[i+2] = blue
        outData[i+3] = red+green+blue === 0 ? 0 : alpha
    }

    ctx.putImageData(new ImageData(outData, image.width, image.height), 0, 0)
    return canvas.toDataURL()
}

const getSource = async (layers) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    for (var i = 0; i < layers.length; i++) {
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
        let src
        if (!shape.src) {
            const originalSrc = await getSource(shape.layers)
            src = await blackToTransparent(originalSrc)
        } else {
            src = await blackToTransparent(shape.src)
        }
        setSelectedShape({...shape, src})
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
    const [shapes, setShapes] = useState([])
    const normalMaps = useSelector((state) => state.normalMaps)

    useEffect(() => {
        const shapes = [...defaultShapes]
        for (var i = 0; i < normalMaps.length; i++) {
            if (!normalMaps[i].status === 'done') { continue }
            shapes.push(normalMaps[i])
        }
        setShapes(shapes)
    }, [currentTool])

    const handleSelect = () => {
        setTool({name: 'shape', shape: selectedShape})
        setOpen(false)
    }
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