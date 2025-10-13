import { useState, useEffect, useRef, useCallback } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    Button,
    FormControl,
    TextField,
    InputLabel,
    Grid,
    Tooltip,
    IconButton,
    CircularProgress,
    Slider,
    Typography
} from '@mui/material'

import ColorSelector from './ColorSelector'
import Editor from './Editor'
import pencil from '../static/pencil32.png'
import ToolButton from './ToolButton'

const MaskEditor = ({ image, maskCanvas, handleSave }) => {
    const [open, setOpen] = useState(false)
    const [alertOpen, setAlertOpen] = useState(false)
    const [overlayAlpha, setOverlayAlpha] = useState(0.5)
    const [pencilSize, setPencilSize] = useState(10)
    const [leftColor, setLeftColor] = useState('#000000')
    const [rightColor, setRightColor] = useState('#ffffff')
    const [tool, setTool] = useState({ name: 'pencil' })
    const [editorSize, setEditorSize] = useState([1920, 1920])
    const [contentElement, setContentElement] = useState(null)

    const [editorState, setEditorState] = useState(null)
    const [editorCursor, setEditorCursor] = useState(0)
    const canvasRef = useRef(null)
    const overlayRef = useRef(null)
    const contentRef = useCallback((element) => {
        setContentElement(element)
    }, [])

    useEffect(() => {
        if (maskCanvas) {
            setEditorState([[{ visible: true, src: maskCanvas.toDataURL() }]])
            setEditorCursor(0)
        }
    }, [maskCanvas, open])

    useEffect(() => {
        if (contentElement) {
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    const { width, height } = entry.contentRect
                    setEditorSize([width, height])
                }
            })
            resizeObserver.observe(contentElement)
            return () => resizeObserver.disconnect()
        }
    }, [contentElement])

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
    if (!maskCanvas || !editorState) { return <CircularProgress /> }

    return (
        <div>
            <Button onClick={ () => { setOpen(true) } } variant="outlined">Edit mask</Button>
            <Dialog
                id='maskEditor'
                open={ open }
                closeAfterTransition={false}
                fullWidth
                maxWidth = 'lg'
                slotProps={{ paper: { sx: { height: '80%' } } }}
            >
                <DialogTitle>Edit the mask</DialogTitle>
                <DialogContent
                    ref={contentRef}
                >
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
                            editorSize={editorSize}
                        />
                        <Editor
                            style={{ pointerEvents: 'none', gridRowStart: 1, gridColumnStart: 1, opacity: overlayAlpha }}
                            src={image}
                            visible={true}
                            canvasRef={overlayRef}
                            tool={tool}
                            setTool={setTool}
                            editorSize={editorSize}
                        />
                    </div>
                </DialogContent>
                <DialogContent>
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
                        <Grid>
                            <Typography>Overlay visibility</Typography>
                            <Slider
                                min={0}
                                max={1}
                                step={0.1}
                                marks={[{ value: 0, label: '0%' }, { value: 0.5, label: '50%' }, { value: 1, label: '100%' }]}
                                value={overlayAlpha}
                                onChange={(e) => setOverlayAlpha(e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={ () => { setAlertOpen(true) }} color="error" variant="outlined">Cancel</Button>
                    <Button onClick={() => {
                        handleSave(canvasRef.current)
                        setOpen(false)
                    }} color="success" variant="outlined">Save</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={ alertOpen } onClose={() => { setAlertOpen(false) }} closeAfterTransition={false}>
                <DialogTitle>You are about to discard changes to the mask</DialogTitle>
                <form onSubmit={(event) => {
                    event.preventDefault()
                    setAlertOpen(false)
                    setOpen(false)
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