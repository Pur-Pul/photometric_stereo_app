import { Dialog, DialogTitle, DialogActions, Button, IconButton, Grid } from '@mui/material'
import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import ToolButton from './ToolButton'
import normal_sphere from '../static/normal_sphere.png'
import normal_sphere32 from '../static/normal_sphere32.png'
import imageService from '../services/images'
import { fetchFlatImage, fetchPage } from '../reducers/normalMapReducer'

const blackToTransparent = async (src, maxHeight) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    
    const image = new Image()
    image.src = src
    await image.decode()

    const aspect = image.width/image.height

    canvas.width = aspect * Math.min(maxHeight, image.height)
    canvas.height = Math.min(maxHeight, image.height)
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    const srcData = ctx.getImageData(0, 0, canvas.width, canvas.height).data
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

    ctx.putImageData(new ImageData(outData, canvas.width, canvas.height), 0, 0)
    return canvas.toDataURL()
}

const Shape = ({shape, selectedShape, setSelectedShape, loading, setLoading, maxHeight}) => {
    const [selected, setSelected] = useState(false)
    const dispatch = useDispatch()

    const loadImage = async () => {
        const src = await blackToTransparent(shape.flatImage.src, maxHeight)
        setSelectedShape({...shape, flatImage: {...shape.flatImage, src }})
        setLoading(false)
        setSelected(false)
    }

    const handleSelect = async () => {
        setLoading(true)
        setSelected(true)
        if (!shape.flatImage || !shape.flatImage.src) {
            dispatch(fetchFlatImage(shape))
            //const originalSrc = await getSource(shape)
            //src = await blackToTransparent(originalSrc, maxHeight)
        } else {
            loadImage()
        }
    }
    useEffect(() => {
        if (loading && selected && shape.flatImage && shape.flatImage.src) {
            loadImage()
        }
    }, [loading, selected, shape])
    return (
        <div>
            <IconButton onClick={loading ? null : handleSelect} sx={loading ? {cursor: 'wait' } : {}}>
                { shape.icon 
                    ? <img src={ shape.icon.src }/>
                    : 'no icon'
                }
            </IconButton>
        </div>
    )
}

const ShapeTool = ({currentTool, setTool, maxHeight}) => {
    const [open, setOpen] = useState(false)
    const [selectedShape, setSelectedShape] = useState(null)
    const defaultShapes = [{ icon: { src: normal_sphere32 }, flatImage: { src: normal_sphere }}]
    const [shapes, setShapes] = useState([])
    const [loading, setLoading] = useState(true)
    const normalMaps = useSelector((state) => state.normalMaps)
    const loggedUser = useSelector((state) => state.login)
    const dispatch = useDispatch()
    useEffect(() => { setLoading(false) }, [currentTool])

    useEffect(() => {
        const shapes = [...defaultShapes]
        for (var i = 0; i < normalMaps.length; i++) {
            if (!normalMaps[i].status === 'done') { continue }
            shapes.push(normalMaps[i])
        }
        setShapes(shapes)

    }, [normalMaps])

    const handleSelect = () => {
        setTool({name: 'shape', shape: selectedShape})
        setOpen(false)   
    }
    const handleLoad = () => {
        dispatch(fetchPage(Math.floor(normalMaps.filter(normalMap => normalMap.creator.id === loggedUser.id).length/10) + 1, 'private'))
        dispatch(fetchPage(Math.floor(normalMaps.filter(normalMap => normalMap.creator.id !== loggedUser.id).length/10) + 1, 'public'))
    }
    return (
        <div>
            <div onClick={() => setOpen(true)}>
                <ToolButton 
                    toolName='shape'
                    currentTool={currentTool}
                    setTool={setTool}
                    icon={selectedShape && selectedShape.icon ? selectedShape.icon.src : 'none'}
                    />
            </div>
            <Dialog open={open} sx={loading ? {cursor: 'wait' } : {}} closeAfterTransition={false}>
                <DialogTitle>Select a shape</DialogTitle>
                <Grid container>
                    {shapes.map((shape, index) => <Shape
                        key={index}
                        shape={shape}
                        selectedShape={selectedShape}
                        setSelectedShape={setSelectedShape}
                        loading={loading}
                        setLoading={setLoading}
                        maxHeight={maxHeight}
                        />
                        )}
                    <Grid size={12}><Button variant='outlined' onClick={handleLoad}>Load more</Button></Grid>
                </Grid>
                <DialogActions>
                    <Button variant='outlined' onClick={() => setOpen(false)} color='error' sx={loading ? {cursor: 'wait' } : {}} disabled={loading}>Cancel</Button>
                    <Button variant='outlined' onClick={handleSelect} sx={loading ? {cursor: 'wait' } : {}} disabled={loading}>Select</Button>
                </DialogActions>
            </Dialog>
        </div>
        
    )
}

export default ShapeTool