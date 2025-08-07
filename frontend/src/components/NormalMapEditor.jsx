import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from 'react-redux'
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

import ColorSelector from "./ColorSelector"
import Editor from "./Editor"
import LayerSelector from "./LayerSelector"

const SIZE_LIMIT = 300

const NormalMapEditor = ({ id, size, layers, handleDiscard }) => {
    const [pencilSize, setPencilSize] = useState(10)
    const [leftColor, setLeftColor] = useState('#000000')
    const [rightColor, setRightColor] = useState('#ffffff')
    const [alertOpen, setAlertOpen] = useState(false)
    const [selectedLayer, setSelectedLayer] = useState(0)
    
    const canvasRefs = Array(5).fill(null).map(() => useRef(null))
    const emptyCanvasRef = useRef(null)
    const initialLayers = [...layers]
    
    const [editorState, setEditorState] = useState([initialLayers.map(layer => layer.src)])
    const [editorCursor, setEditorCursor] = useState(0)
    const dispath = useDispatch()


    useEffect(() => {
        emptyCanvasRef.current = document.createElement('canvas')
        emptyCanvasRef.current.width = size[0]
        emptyCanvasRef.current.height = size[1]
        
        const ctx = emptyCanvasRef.current.getContext('2d')
        ctx.fillStyle = 'rgba(0, 0, 0, 0)'
        ctx.fillRect(0, 0, size[0], size[1])
        if (initialLayers.length === 0) {
            initialLayers.push({ src: emptyCanvasRef.current.toDataURL() })
        }
        setEditorState([initialLayers.map(layer => layer.src)])
    }, [])

    const handleSave = () => {
        // TODO
        // Update local normal map with new and updated layers using reducers.
        // Save new layers to backend using image service post.
        // Update exisitng layers in backend using image service put.
        console.log('Save function not yet implemented.')
    }

    const addLayer = () => {
        if (editorState[editorCursor].length < canvasRefs.length) {
            updateEditorState(editorState[editorCursor].length, emptyCanvasRef.current.toDataURL())
        }
    }

    const removeLayer = (index) => {
        updateEditorState(index, null)
    }

    const updateEditorState = (layerIndex, src) => {
        const currentState = editorState.slice(0, editorCursor+1)
        if (currentState.length == 0) {
            let newState = initialLayers.map(layer => layer.src)
            
            newState[layerIndex] = src
            setEditorState([newState])
        } else {
            let newState = [...currentState[editorCursor]]
            if (layerIndex === newState.length) {
                newState.push(src)
            } else if (layerIndex < newState.length) {
                newState[layerIndex] = src
            } else {
                console.log('Editor state error')
                return
            }
            
            setEditorState([...currentState, newState])
        }
        setEditorCursor(editorCursor+1)
    }
    return (
        <div style={{ margin: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr' }}>
                {editorState[editorCursor].map((src, index) => {
                    return src ? <Editor 
                    key={index}
                    style={{ pointerEvents: index !== selectedLayer ? 'none' : 'auto', gridRowStart: 1, gridColumnStart: 1}}
                    src={src}
                    pencilSize={pencilSize}
                    leftColor={leftColor}
                    rightColor={rightColor}
                    canvasRef={canvasRefs[index]}
                    layerIndex={index}
                    updateEditorState={updateEditorState}
                    />
                    : null
                }
                )}
            </div>
            <div>
                <Grid container sx={{ justifyContent: "space-evenly", alignItems: "center", border: '2px solid', padding: '10px', borderRadius: '5px'}}>
                    <LayerSelector layers={editorState[editorCursor]} selectedLayer={selectedLayer} setSelectedLayer={setSelectedLayer} addLayer={addLayer} removeLayer={removeLayer}/> 
                    <ColorSelector 
                        leftColor={leftColor}
                        rightColor={rightColor}
                        setLeftColor={setLeftColor}
                        setRightColor={setRightColor}
                        />
                    
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
                            <IconButton sx={{ border: '2px solid', width: '40%', marginRight: '5px'}} disabled={editorCursor === 0} onClick={ () => setEditorCursor(editorCursor ? editorCursor-1 : 0)}> ↶ </IconButton>
                        </Tooltip>
                        <Tooltip title={ 'Redo' } placement='top'>
                            <IconButton  sx={{ border: '2px solid', width: '40%', marginLeft: '5px'}} disabled={editorCursor >= editorState.length-1} onClick={ () => setEditorCursor(editorCursor < editorState.length-1 ? editorCursor+1 : editorCursor)}>↷</IconButton>
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