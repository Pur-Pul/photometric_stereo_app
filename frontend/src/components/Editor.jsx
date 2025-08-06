import { useState, useEffect, useRef } from "react"

const SIZE_LIMIT = 1000

const Editor = ({ src, canvasRef, pencilSize, leftColor, rightColor, style }) => {
    const [drawing, setDrawing] = useState(false)
    const [firstLoad, setFirstLoad] = useState(true)
    const [size, setSize] = useState(null)
    const [canvasSize, setCanvasSize] = useState(null)
    const [scale, setScale] = useState([1,1])

    //const canvasRef = useRef(null)
    const ctxRef = useRef(null)
    const [mouse, setMouse] = useState(-1)

    window.onmousedown = (event) => { mouse === -1 ? setMouse(event.button) : null}
    window.onmouseup = (event) => { if(event.button === mouse) { 
        setMouse(-1) 
        setDrawing(false)
    }}

    const calculateCanvasSize = (imageSize, editorSize) => {
        const canvasAspect = imageSize[0]/imageSize[1]
        const editorAspect = editorSize[0]/editorSize[1]

        const newCanvasSize = canvasAspect >= editorAspect 
            ? [editorSize[0], editorSize[0] / canvasAspect]
            : [editorSize[1] * canvasAspect, editorSize[1]]

        if (canvasSize && (newCanvasSize[0] !== canvasSize[0] || newCanvasSize[1] !== canvasSize[1])) {
            setCanvasSize(newCanvasSize)
            setScale([
                (canvasSize[0]*scale[0])/newCanvasSize[0],
                (canvasSize[1]*scale[1])/newCanvasSize[1]
            ])
        } else if (!canvasSize) {
            setCanvasSize(newCanvasSize)
        }
        

        const canvas = canvasRef.current
        if (firstLoad) {
            if (Math.max(imageSize[0], imageSize[1]) > SIZE_LIMIT) {
                canvas.width = canvasAspect >= 1 ? SIZE_LIMIT : canvasAspect * SIZE_LIMIT
                canvas.height = canvasAspect >= 1 ? SIZE_LIMIT / canvasAspect : SIZE_LIMIT
            } else {
                canvas.width = imageSize[0]
                canvas.height = imageSize[1]
            }
        }
        
        canvas.style.width = `${newCanvasSize[0]-2}px`
        canvas.style.height = `${newCanvasSize[1]-2}px`
        return canvasAspect >= editorAspect ? canvas.width/editorSize[0] : canvas.height/editorSize[1]
    }

    const image = new Image()
    image.onload = () => {
        if (firstLoad) {
            setFirstLoad(false)
            const size = [image.width,image.height]
            setSize(size)
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d', { willReadFrequently: true })

            const canvasScale = calculateCanvasSize(size, [window.innerWidth, window.innerHeight * 0.8]) 

            ctx.drawImage(image, 0, 0, canvasRef.current.width, canvasRef.current.height)
            ctx.scale(canvasScale, canvasScale)
            ctxRef.current = ctx
        }
    }
    image.src = src

    useEffect(() => {
        if (size) {
            const handleResize = () => {
                calculateCanvasSize(size, [window.innerWidth, window.innerHeight * 0.8])
            }

            window.addEventListener("resize", handleResize)
        }
        
    }, [size])

    const draw = (event) => { 
        const x = event.nativeEvent.offsetX*scale[0]
        const y = event.nativeEvent.offsetY*scale[1]
        if (drawing) {
            ctxRef.current.lineTo(x,y)
            ctxRef.current.stroke()
        }
    }

    const startDraw = (event) => {
        const x = event.nativeEvent.offsetX*scale[0]
        const y = event.nativeEvent.offsetY*scale[1]
        const button = event.nativeEvent.button
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