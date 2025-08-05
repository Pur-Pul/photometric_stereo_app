import { useState, useEffect, useRef } from "react"

const SIZE_LIMIT = 300

const Editor = ({ src, canvasRef, pencilSize, leftColor, rightColor, style }) => {
    const [drawing, setDrawing] = useState(false)
    const [size, setSize] = useState(null)

    //const canvasRef = useRef(null)
    const ctxRef = useRef(null)
    const [mouse, setMouse] = useState(-1)

    window.onmousedown = (event) => { mouse === -1 ? setMouse(event.button) : null}
    window.onmouseup = (event) => { if(event.button === mouse) { 
        setMouse(-1) 
        setDrawing(false)
    }}

    const image = new Image()
    image.onload = () => {
        if (!size) {
            const size = [image.width,image.height]
            setSize(size)
            let editorWidth = window.innerWidth
            let editorHeight = window.innerHeight
            editorHeight *= 0.8

            const canvasAspect = size[0]/size[1]
            const editorAspect = editorWidth/editorHeight
            
            const windowSize = canvasAspect >= editorAspect 
                ? [editorWidth, editorWidth / canvasAspect]
                : [editorHeight * canvasAspect, editorHeight]

            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d', { willReadFrequently: true })
            if (Math.max(size[0], size[1]) > SIZE_LIMIT) {
                canvas.width = canvasAspect >= 1 ? SIZE_LIMIT : canvasAspect * SIZE_LIMIT
                canvas.height = canvasAspect >= 1 ? SIZE_LIMIT / canvasAspect : SIZE_LIMIT
            } else {
                canvas.width = size[0]
                canvas.height = size[1]
            }
            const scale = canvasAspect >= editorAspect ? canvas.width/editorWidth : canvas.height/editorHeight
            canvas.style.width = `${windowSize[0]-2}px`
            canvas.style.height = `${windowSize[1]-2}px`
            ctx.drawImage(image, 0, 0, canvasRef.current.width, canvasRef.current.height)
            ctx.scale(scale, scale)
            ctxRef.current = ctx
        }
        
    }
    image.src = src

    const draw = (event) => {
        const {offsetX:x, offsetY:y} = event.nativeEvent
        if (drawing) {
            ctxRef.current.lineTo(x,y)
            ctxRef.current.stroke()
        }
    }

    const startDraw = (event) => {
        const {offsetX:x, offsetY:y, button} = event.nativeEvent
        ctxRef.current.strokeStyle = button == 0 ? leftColor : rightColor
        ctxRef.current.fillStyle = button == 0 ? leftColor : rightColor
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

    const pauseDraw = () => {
        if (drawing) { ctxRef.current.closePath() }
    }

    const continueDraw = (event) => {
        ctxRef.current.beginPath()
    }

    const editor = {
        border: '1px solid rgba(0,0,0,1)'
    }


    return (
        <div style={{ margin: 'auto', ...style}}>
            <canvas 
                ref={ canvasRef }
                onMouseDown={ startDraw }
                onMouseUp={ endDraw }
                onMouseMove={ draw }
                onMouseLeave={ pauseDraw }
                onMouseEnter={ continueDraw }
                onContextMenu={ (e) => e.preventDefault()}
                style={editor}
                />
        </div>
    )
}

export default Editor