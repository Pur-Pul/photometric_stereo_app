import { Dialog, DialogTitle, DialogActions, Button, Grid } from '@mui/material'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import ToolButton from './ToolButton'
import normal_sphere from '../static/normal_sphere.png'
import normal_sphere32 from '../static/normal_sphere32.png'
import { fetchFlatImage, fetchPage } from '../reducers/normalMapReducer'
import shape32 from '../static/shape32.png'

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

const Shape = ({ shape, selectedShape, setSelectedShape, loading, setLoading, maxHeight }) => {
    const dispatch = useDispatch()
    const handleSelect = async () => {
        if (shape.flatImage === undefined) {
            return
        }

        setLoading(true)
        setSelectedShape(shape)

        if (!shape?.flatImage?.src) {
            dispatch(fetchFlatImage(shape))
        }
    }

    useEffect(() => {
        if (loading && selectedShape.id === shape.id && shape?.flatImage?.src) {
            setSelectedShape(shape)
        }
    }, [loading, shape, selectedShape, setSelectedShape])
    return (
        <div>
            <Button
                onClick={loading ? null : handleSelect}
                sx={{ cursor: loading ? 'wait' : 'pointer', border: selectedShape && shape && selectedShape.id === shape.id ? 'solid black 1px' : '' }}>
                <div style={{ display: 'grid' }}>
                    <img src={ shape?.icon?.src ?? shape32 } width='64px' style={{ gridColumnStart: 1, gridRowStart: 1 }}/>
                    {
                        shape?.icon?.src
                            ? null
                            : <div style={{
                                gridColumnStart: 1,
                                gridRowStart: 1,
                                textAlign: 'center',
                                verticalAlign: 'middle',
                                lineHeight: '64px',
                                fontSize: '9px',
                                color: '#ffffff'
                            }}>
                                No icon
                            </div>
                    }
                </div>
            </Button>
        </div>
    )
}

const defaultShapes = [{ icon: { src: normal_sphere32 }, flatImage: { src: normal_sphere }, id: 'normal_sphere' }]

const ShapeTool = ({ currentTool, setTool, maxHeight }) => {
    const [open, setOpen] = useState(false)
    const [selectedShape, setSelectedShape] = useState(null)
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
        setTool({ name: 'shape', shape: selectedShape })
        setOpen(false)
    }
    const handleLoad = () => {
        dispatch(fetchPage(Math.floor(normalMaps.filter(normalMap => normalMap.creator.id === loggedUser.id).length/10) + 1, 'private'))
        dispatch(fetchPage(Math.floor(normalMaps.filter(normalMap => normalMap.creator.id !== loggedUser.id).length/10) + 1, 'public'))
    }

    useEffect(() => {
        const loadImage = async () => {
            const src = await blackToTransparent(selectedShape.flatImage.src, maxHeight)
            setSelectedShape({ ...selectedShape, flatImage: { ...selectedShape.flatImage, src } })
            setLoading(false)
        }
        if (loading && selectedShape?.flatImage?.src) {
            loadImage()
        }
    }, [selectedShape, maxHeight, loading, setLoading])

    return (
        <div>
            <div onClick={() => setOpen(true)}>
                <ToolButton
                    toolName='shape'
                    currentTool={currentTool}
                    setTool={setTool}
                    icon={selectedShape && selectedShape.icon ? selectedShape.icon.src : shape32}
                />
            </div>
            <Dialog open={open} sx={loading ? { cursor: 'wait' } : {}} closeAfterTransition={false}>
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
                    <Button variant='outlined' onClick={() => setOpen(false)} color='error' sx={loading ? { cursor: 'wait' } : {}} disabled={loading}>Cancel</Button>
                    <Button variant='outlined' onClick={handleSelect} sx={loading ? { cursor: 'wait' } : {}} disabled={loading}>Select</Button>
                </DialogActions>
            </Dialog>
        </div>

    )
}

export default ShapeTool