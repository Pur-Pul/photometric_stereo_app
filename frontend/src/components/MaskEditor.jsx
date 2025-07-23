import { useState, useEffect, useRef } from "react"
import DialogContent from "@mui/material/DialogContent"
import Button from "@mui/material/Button"
import DialogActions from "@mui/material/DialogActions"
const MaskEditor = ({ width, height, handleSave }) => {
    const [drawing, setDrawing] = useState(false)
    const [windowSize, setWindowSize] = useState([0,0])
    const canvasRef = useRef(null)
    const ctxRef = useRef(null)

    useEffect(() => {
        let { clientWidth:editorWidth, clientHeight:editorHeight } = document.getElementById('maskEditor').getElementsByClassName('MuiPaper-root')[0]
        editorHeight *= 0.8

        const canvasAspect = width/height
        const editorAspect = editorWidth/editorHeight
        console.log(window.innerWidth, window.innerHeight)
        
        const scale = canvasAspect >= editorAspect ? width/editorWidth : height/editorHeight
        const windowSize = canvasAspect >= editorAspect 
            ? [editorWidth, editorWidth / canvasAspect]
            : [editorHeight * canvasAspect, editorHeight]
        setWindowSize(windowSize)

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        console.log(editorWidth, editorHeight)
        canvas.width = width
        canvas.height = height
        canvas.style.width = `${windowSize[0]}px`
        canvas.style.height = `${windowSize[1]}px`
        console.log(canvas.style.width, canvas.style.height)
        ctx.scale(scale, scale)
        
        ctx.lineWidth = 10
        ctxRef.current = ctx 
    }, [])


    const draw = (event) => {
        if (drawing) {
            ctxRef.current.lineTo(
                event.nativeEvent.offsetX,
                event.nativeEvent.offsetY
            )
            ctxRef.current.stroke()
        }
    }

    const startDraw = (event) => {
        
        ctxRef.current.strokeStyle = event.button == 0 ? '#000000' : '#ffffff'
        ctxRef.current.beginPath()
        ctxRef.current.moveTo(
            event.nativeEvent.offsetX,
            event.nativeEvent.offsetY
        )
        console.log(event.nativeEvent.offsetX, event.nativeEvent.offsetY)
        setDrawing(true)
    }

    const endDraw = () => {
        ctxRef.current.closePath()
        setDrawing(false)
    }

    return (
        <div style={{ margin: 'auto' }}>
            <canvas 
                ref={canvasRef}
                onMouseDown={startDraw}
                onMouseUp={endDraw}
                onMouseMove={draw}
                onContextMenu={(e) => e.preventDefault()}
        
                />
            <form onSubmit={handleSave} style={{display: 'block'}}>
                <DialogActions>
                    <Button onClick={ () => { setAlertOpen(true) } }>Cancel</Button>
                    <Button type="submit">Save</Button>
                </DialogActions>
            </form>
        </div>
    )
}

export default MaskEditor