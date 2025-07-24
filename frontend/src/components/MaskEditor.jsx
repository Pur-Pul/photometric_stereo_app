import { useState, useEffect, useRef } from "react"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import Button from "@mui/material/Button"
import Checkbox from "@mui/material/Checkbox"
import FormControlLabel from "@mui/material/FormControlLabel"
import DialogActions from "@mui/material/DialogActions"
import TextField from "@mui/material/TextField"
import InputLabel from "@mui/material/InputLabel"
import FormControl from "@mui/material/FormControl"

const MaskEditor = ({ size, image, handleSave, handleDiscard }) => {
    const [drawing, setDrawing] = useState(false)
    const [windowSize, setWindowSize] = useState([0,0])
    const [alertOpen, setAlertOpen] = useState(false)
    const [showOverlay, setShowOverlay] = useState(true)
    const [pencilSize, setPencilSize] = useState(10)
    const canvasRef = useRef(null)
    const ctxRef = useRef(null)
    const [mouse, setMouse] = useState(-1)

    window.onmousedown = (event) => { mouse === -1 ? setMouse(event.button) : null}
    window.onmouseup = (event) => { if(event.button === mouse) { setMouse(-1) }}

    console.log(mouse)

    useEffect(() => {
        let { clientWidth:editorWidth, clientHeight:editorHeight } = document.getElementById('maskEditor').getElementsByClassName('MuiPaper-root')[0]
        editorHeight *= 0.8

        const canvasAspect = size[0]/size[1]
        const editorAspect = editorWidth/editorHeight
        const scale = canvasAspect >= editorAspect ? size[0]/editorWidth : size[1]/editorHeight
        const windowSize = canvasAspect >= editorAspect 
            ? [editorWidth, editorWidth / canvasAspect]
            : [editorHeight * canvasAspect, editorHeight]
        setWindowSize(windowSize)

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        canvas.width = size[0]
        canvas.height = size[1]
        canvas.style.width = `${windowSize[0]-2}px`
        canvas.style.height = `${windowSize[1]-2}px`
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.scale(scale, scale)
        ctxRef.current = ctx 
    }, [])


    const draw = (event) => {
        const {offsetX:x, offsetY:y} = event.nativeEvent
        if (drawing) {
            ctxRef.current.lineTo(x,y)
            ctxRef.current.stroke()
        }
    }

    const startDraw = (event) => {
        //console.log(event.nativeEvent)
        const {offsetX:x, offsetY:y} = event.nativeEvent
        ctxRef.current.strokeStyle = event.button == 0 ? '#000000' : '#ffffff'
        ctxRef.current.fillStyle = event.button == 0 ? '#000000' : '#ffffff'
        ctxRef.current.lineWidth = pencilSize
        ctxRef.current.lineCap = 'round'
        ctxRef.current.beginPath()
        ctxRef.current.moveTo(x,y)
        ctxRef.current.arc(x,y,pencilSize/2,0,Math.PI*2,false)
        ctxRef.current.fill()
        ctxRef.current.closePath()
        ctxRef.current.beginPath()
        ctxRef.current.moveTo(x,y)
        setDrawing(true)
    }

    const endDraw = () => {
        ctxRef.current.closePath()
        setDrawing(false)
    }

    const continueDraw = (event) => {
        const {offsetX:x, offsetY:y} = event.nativeEvent
        //console.log(event.nativeEvent)
        if (mouse == -1) { return }
        ctxRef.current.strokeStyle = mouse == 0 ? '#000000' : '#ffffff'
        ctxRef.current.fillStyle = mouse == 0 ? '#000000' : '#ffffff'
        ctxRef.current.lineWidth = pencilSize
        ctxRef.current.lineCap = 'round'
        ctxRef.current.beginPath()
        //ctxRef.current.moveTo(x,y)
        setDrawing(true)
    }


    const editor = {
        position: 'relative',
        opacity: showOverlay ? 0.5 : 1,
        border: '1px solid rgba(0,0,0,1)'
    }
    const overlay = {
        width: `${windowSize[0]-2}px`,
        height: `${windowSize[1]-2}px`,
        position: 'absolute',
        opacity : 1,
        z_index: -1
    }

    return (
        <div style={{ margin: 'auto' }}>
            <img style={{ ...editor, ...overlay }} src={image} alt="Mask editor overlay"/>
            <canvas 
                ref={canvasRef}
                onMouseDown={ startDraw }
                onMouseUp={ endDraw }
                onMouseMove={ draw }
                onMouseLeave={ endDraw }
                onMouseEnter={ continueDraw }
                onContextMenu={ (e) => e.preventDefault()}
                style={editor}
                />
            <DialogActions style={{ margin: 'auto' }}>
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
                
                <FormControlLabel control={ <Checkbox defaultChecked value={ showOverlay } onChange={(e) => setShowOverlay(current => !current)}/> } label="Overlay image"/>
                <Button onClick={ () => { setAlertOpen(true) }}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
            </DialogActions>
            <Dialog open={ alertOpen } onClose={() => { setAlertOpen(false) }} closeAfterTransition={false}>
                <DialogTitle>You are about to discard changes to the mask</DialogTitle>
                <form onSubmit={(event) => {
                    event.preventDefault()
                    setAlertOpen(false)
                    handleDiscard()
                }}> 
                    <DialogActions>
                        <Button onClick={ () => { setAlertOpen(false) } }>Cancel</Button>
                        <Button type="submit">Discard</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    )
}

export default MaskEditor