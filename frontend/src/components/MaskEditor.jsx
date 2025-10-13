import { useState, useEffect, useRef } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogActions,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    TextField,
    InputLabel,
    Grid,
    Tooltip,
    IconButton
} from '@mui/material'

import ColorSelector from './ColorSelector'
import Editor from './Editor'
import pencil from '../static/pencil32.png'
import ToolButton from './ToolButton'

const MaskEditor = ({ size, image, maskCanvas, handleSave, handleDiscard }) => {
    const [alertOpen, setAlertOpen] = useState(false)
    const [showOverlay, setShowOverlay] = useState(true)
    const [pencilSize, setPencilSize] = useState(10)
    const [leftColor, setLeftColor] = useState('#000000')
    const [rightColor, setRightColor] = useState('#ffffff')
    const [tool, setTool] = useState({ name: 'pencil' })

    const [editorState, setEditorState] = useState([[{ visible: true, src: maskCanvas.toDataURL() }]])
    const [editorCursor, setEditorCursor] = useState(0)
    const canvasRef = useRef(null)
    const overlayRef = useRef(null)

    useEffect(() => {
        setEditorState([[{ visible: true, src: maskCanvas.toDataURL() }]])
        setEditorCursor(0)
    }, [maskCanvas])

    const updateEditorState = (layerIndex, layer) => {
        const currentState = editorState.slice(0, editorCursor+1)
        let newState = [...currentState[editorCursor]]
        if (layerIndex === newState.length) {
            layer ? newState.push(layer) : null
        } else if (layerIndex < newState.length) {
            layer ? newState.splice(layerIndex, 1, layer) : newState.splice(layerIndex, 1)
        } else {
            return
        }

        setEditorState([...currentState, newState])
        setEditorCursor(editorCursor+1)
    }
    return (
        <div style={{ margin: 'auto', width: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr' }}>
                <Editor
                    style={{ gridRowStart: 1, gridColumnStart: 1 }}
                    src={editorState[editorCursor][0].src}
                    visible={true}
                    canvasRef={canvasRef}
                    pencilSize={pencilSize}
                    leftColor={leftColor}
                    rightColor={rightColor}
                    setLeftColor={setLeftColor}
                    setRightColor={setRightColor}
                    layerIndex={0}
                    updateEditorState={updateEditorState}
                    tool={tool}
                    setTool={setTool}
                />
                <Editor
                    style={{ pointerEvents: 'none', gridRowStart: 1, gridColumnStart: 1, opacity: 0.5 }}
                    src={image}
                    visible={showOverlay}
                    canvasRef={overlayRef}
                    tool={tool}
                    setTool={setTool}

                />
            </div>
            <Grid
                container
                sx={{
                    justifyContent: 'space-evenly',
                    alignItems: 'flex-start',
                    border: '2px solid',
                    padding: '10px',
                    borderRadius: '5px'
                }}
            >
                <ColorSelector leftColor={leftColor} rightColor={rightColor} setLeftColor={setLeftColor} setRightColor={setRightColor} enableColorWheel={false}/>
                <ToolButton toolName='pencil' currentTool={tool} setTool={setTool} icon={pencil}/>
                <FormControl>
                    <InputLabel htmlFor="pencil-size" shrink>Pencil size:</InputLabel>
                    <TextField
                        id="pencil-size"
                        type="number"
                        slotProps={{ htmlInput : { min:1, max:300 } }}
                        value={pencilSize}
                        onChange={(e) => setPencilSize(e.target.value)}
                    />
                </FormControl>
                <div style={{ width:'120px' }}>
                    <Tooltip title={ 'Undo' } placement='top'>
                        <span>
                            <IconButton sx={{ border: '2px solid', width: '40%', marginRight: '5px' }} disabled={editorCursor === 0} onClick={ () => setEditorCursor(editorCursor ? editorCursor-1 : 0)}> ↶ </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title={ 'Redo' } placement='top'>
                        <span>
                            <IconButton  sx={{ border: '2px solid', width: '40%', marginLeft: '5px' }} disabled={editorCursor >= editorState.length-1} onClick={ () => setEditorCursor(editorCursor < editorState.length-1 ? editorCursor+1 : editorCursor)}>↷</IconButton>
                        </span>
                    </Tooltip>
                </div>
                <FormControlLabel control={ <Checkbox defaultChecked value={ showOverlay } onChange={(e) => setShowOverlay(current => !current)}/> } label="Overlay image"/>
            </Grid>

            <DialogActions style={{ margin: 'auto' }}>
                <Button onClick={ () => { setAlertOpen(true) }} color="error" variant="outlined">Cancel</Button>
                <Button onClick={() => handleSave(canvasRef.current)} color="success" variant="outlined">Save</Button>
            </DialogActions>

            <Dialog open={ alertOpen } onClose={() => { setAlertOpen(false) }} closeAfterTransition={false}>
                <DialogTitle>You are about to discard changes to the mask</DialogTitle>
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

export default MaskEditor