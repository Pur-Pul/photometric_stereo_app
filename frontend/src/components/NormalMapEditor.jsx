import { useState, useEffect, useRef } from "react"
import { useDispatch } from 'react-redux'
import { 
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogActions,
    TextField,
    InputLabel,
    FormControl,
    Grid,
    Tooltip
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

import { performCreate, performLayerUpdate } from "../reducers/normalMapReducer"
import ColorSelector from "./ColorSelector"
import Editor from "./Editor"
import LayerSelector from "./LayerSelector"
import pencil from '../static/pencil32.png'
import pipette from "../static/pipette32.png"
import eraser from '../static/eraser32.png'
import ToolButton from './ToolButton'
import ShapeTool from "./ShapeTool"


const NormalMapEditor = ({ id, size, layers, handleDiscard }) => {
    const [pencilSize, setPencilSize] = useState(10)
    const [leftColor, setLeftColor] = useState('#8080ff')
    const [rightColor, setRightColor] = useState('#000000')
    const [alertOpen, setAlertOpen] = useState(false)
    const [selectedLayer, setSelectedLayer] = useState(0)
    const [tool, setTool] = useState({name:'pencil'})
    
    const canvasRefs = Array(5).fill(null).map(() => useRef(null))
    const emptyCanvasRef = useRef(null)
    const iconCanvasRef = useRef(null)
    const initialLayers = [...layers]

    const [editorState, setEditorState] = useState([initialLayers.map(layer => { return { ...layer, visible: true }})])
    const [editorCursor, setEditorCursor] = useState(0)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    

    useEffect(() => {
        emptyCanvasRef.current = document.createElement('canvas')
        emptyCanvasRef.current.width = size[0]
        emptyCanvasRef.current.height = size[1]
        
        const aspect = size[0] / size[1]

        iconCanvasRef.current = document.createElement('canvas')
        iconCanvasRef.current.width = aspect * 64
        iconCanvasRef.current.height = 64
        
        const ctx = emptyCanvasRef.current.getContext('2d')
        ctx.fillStyle = 'rgba(0, 0, 0, 0)'
        ctx.fillRect(0, 0, size[0], size[1])
        if (initialLayers.length === 0) {
            initialLayers.push({ src: emptyCanvasRef.current.toDataURL() })
        }
        setEditorState([initialLayers.map(layer => { return { ...layer, visible: true }})])
        setEditorCursor(0)
    }, [])

    const handleSave = async () => {
        const blobs = []
        const canvas = iconCanvasRef.current
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        for (var i = 0; i < editorState[editorCursor].length; i++) {
            const blob = await new Promise(resolve => canvasRefs[i].current.toBlob(resolve))
            blobs.push(blob)
            const image = new Image()
            image.src = canvasRefs[i].current.toDataURL()
            await image.decode()
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
        }
        const iconBlob = await new Promise(resolve => iconCanvasRef.current.toBlob(resolve))

        if (id) {
            dispatch(performLayerUpdate(blobs, iconBlob, editorState[editorCursor], id))
        } else {
            dispatch(performCreate(blobs, iconBlob, navigate))
        }
    }

    const addLayer = () => {
        if (editorState[editorCursor].length < canvasRefs.length) {
            updateEditorState(editorState[editorCursor].length, { src: emptyCanvasRef.current.toDataURL(), visible: true })
        }
        selectedLayer < 0 ? setSelectedLayer(0) : null
    }

    const removeLayer = (index) => {
        updateEditorState(index, undefined)
        if (selectedLayer >= index) {
            setSelectedLayer(selectedLayer-1)
        }
    }

    const toggleLayer = (index) => {
        const layer = editorState[editorCursor][index]
        updateEditorState(index, {...layer, visible: !layer.visible})
    }

    const updateEditorState = (layerIndex, layer) => {
        const currentState = editorState.slice(0, editorCursor+1)
        let newState = [...currentState[editorCursor]]
        if (layerIndex === newState.length) {
            layer ? newState.push(layer) : null
        } else if (layerIndex < newState.length) {
            layer ? newState.splice(layerIndex, 1, layer) : newState.splice(layerIndex, 1)
        } else {
            console.log('Editor state error')
            return
        }
        
        setEditorState([...currentState, newState])
        setEditorCursor(editorCursor+1)
    }

    return (
        <div style={{ margin: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr' }}>
                {editorState[editorCursor].map((layer, index) => {
                    return layer ? <Editor 
                    key={index}
                    visible={layer.visible}
                    style={{ pointerEvents: index !== selectedLayer ? 'none' : 'auto', gridRowStart: 1, gridColumnStart: 1}}
                    tool={tool}
                    setTool={setTool}
                    src={layer.src}
                    pencilSize={pencilSize}
                    leftColor={leftColor}
                    rightColor={rightColor}
                    setLeftColor={setLeftColor}
                    setRightColor={setRightColor}
                    canvasRef={canvasRefs[index]} 
                    layerIndex={index}
                    updateEditorState={updateEditorState}
                    />
                    : null
                }
                )}
            </div>
            <div>
                <Grid 
                    container 
                    sx={{
                        justifyContent: "space-evenly",
                        alignItems: "flex-start",
                        border: '2px solid',
                        padding: '10px',
                        borderRadius: '5px'
                    }}
                    >
                    <LayerSelector 
                        layers={editorState[editorCursor]}
                        selectedLayer={selectedLayer}
                        setSelectedLayer={setSelectedLayer}
                        addLayer={addLayer}
                        removeLayer={removeLayer}
                        toggleLayer={toggleLayer}
                        />
                    <ColorSelector 
                        leftColor={leftColor}
                        rightColor={rightColor}
                        setLeftColor={setLeftColor}
                        setRightColor={setRightColor}
                        />
                    <ToolButton toolName='pencil' currentTool={tool} setTool={setTool} icon={pencil}/>
                    <ToolButton toolName='pipette' currentTool={tool} setTool={setTool} icon={pipette}/>
                    <ToolButton toolName='eraser' currentTool={tool} setTool={setTool} icon={eraser}/>
                    <ShapeTool currentTool={tool} setTool={setTool} />
                    <FormControl>
                        <InputLabel htmlFor="pencil-size" shrink>Pencil size:</InputLabel>
                        <TextField
                            id="pencil-size"
                            type="number"
                            slotProps={{ htmlInput : { min:1, max:300 }}}
                            value={pencilSize}
                            onChange={(e) => setPencilSize(e.target.value)}
                            />
                    </FormControl>
                    <div style={{ width:'120px' }}>
                        <Tooltip title={ 'Undo' } placement='top'>
                            <span>
                                <IconButton sx={{ border: '2px solid', width: '40%', marginRight: '5px'}} disabled={editorCursor === 0} onClick={ () => setEditorCursor(editorCursor ? editorCursor-1 : 0)}> ↶ </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title={ 'Redo' } placement='top'>
                            <span>
                                <IconButton  sx={{ border: '2px solid', width: '40%', marginLeft: '5px'}} disabled={editorCursor >= editorState.length-1} onClick={ () => setEditorCursor(editorCursor < editorState.length-1 ? editorCursor+1 : editorCursor)}>↷</IconButton>
                            </span>
                        </Tooltip>
                    </div>
                </Grid>
                <Grid container sx={{ justifyContent: "flex-end"}}>
                    <Button variant="outlined" color="error" onClick={ () => { setAlertOpen(true) }}  >Cancel</Button>
                    <Button variant="outlined" color="success"onClick={ handleSave }  >Save</Button>
                </Grid>
            </div>

            <Dialog open={ alertOpen } onClose={() => { setAlertOpen(false) }} closeAfterTransition={false}>
                <DialogTitle>You are about to discard changes.</DialogTitle>
                <form onSubmit={(event) => {
                    event.preventDefault()
                    setAlertOpen(false)
                    handleDiscard()
                }}> 
                    <DialogActions>
                        <Button onClick={ () => { setAlertOpen(false) } } variant="outlined">Cancel</Button>
                        <Button type="submit" color="error" variant="outlined">Discard</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    )
}

export default NormalMapEditor