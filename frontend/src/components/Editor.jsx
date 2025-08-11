import { useState, useEffect, useRef } from "react"
import pipett from '../static/pipett32.png'
import pencil from '../static/pencil32.png'
import eraser from '../static/eraser32.png'

const SIZE_LIMIT = 1000

const Editor = ({ 
    src,
    visible,
    canvasRef,
    pencilSize,
    leftColor,
    rightColor,
    setLeftColor,
    setRightColor,
    style,
    layerIndex,
    updateEditorState,
    tool,
    setTool
}) => {
    const [drawing, setDrawing] = useState(false)
    const [firstLoad, setFirstLoad] = useState(true)
    const [size, setSize] = useState(null)
    const [canvasSize, setCanvasSize] = useState(null)
    const [scale, setScale] = useState([1,1])

    const ctxRef = useRef(null)
    const [mouse, setMouse] = useState(-1)

    const cursorCanvasRef = useRef(null)

    window.onmousedown = (event) => { mouse === -1 ? setMouse(event.button) : null}
    window.onmouseup = (event) => { if(event.button === mouse) { 
        setMouse(-1) 
        setDrawing(false)
    }}

    useEffect(() => {
        setFirstLoad(true)
    }, [src])
    const calculateCanvasSize = (imageSize, editorSize) => {
        const canvasAspect = imageSize[0]/imageSize[1]
        const editorAspect = editorSize[0]/editorSize[1]

        const canvasSize = canvasAspect >= editorAspect 
            ? [editorSize[0], editorSize[0] / canvasAspect]
            : [editorSize[1] * canvasAspect, editorSize[1]]

        
        setCanvasSize(canvasSize)


        const canvas = canvasRef.current
        const cursorCanvas = cursorCanvasRef.current
        if (firstLoad) {
            if (Math.max(imageSize[0], imageSize[1]) > SIZE_LIMIT) {
                canvas.width = canvasAspect >= 1 ? SIZE_LIMIT : canvasAspect * SIZE_LIMIT
                canvas.height = canvasAspect >= 1 ? SIZE_LIMIT / canvasAspect : SIZE_LIMIT
            } else {
                canvas.width = imageSize[0]
                canvas.height = imageSize[1]
            }
            cursorCanvas.width = canvas.width
            cursorCanvas.height = canvas.height
        }
        canvas.style.width = `${canvasSize[0]-2}px`
        canvas.style.height = `${canvasSize[1]-2}px`
        cursorCanvas.style.width = canvas.style.width
        cursorCanvas.style.height = canvas.style.height
        setScale([canvas.width/canvasSize[0], canvas.height/canvasSize[1]])
    }

    const image = new Image()
    image.onload = () => {
        if (firstLoad) {
            setFirstLoad(false)
            const size = [image.width,image.height]
            setSize(size)
            const canvas = canvasRef.current
            const cursorCanvas = cursorCanvasRef.current
            ctxRef.current = {
                picture: canvas.getContext('2d', { willReadFrequently: true }),
                cursor: cursorCanvas.getContext('2d', { willReadFrequently: true }),
            }

            calculateCanvasSize(size, [window.innerWidth, window.innerHeight * 0.8]) 

            ctxRef.current.picture.drawImage(image, 0, 0, canvasRef.current.width, canvasRef.current.height)
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
        const ctx = ctxRef.current
        const color = mouse < 1 ? leftColor : rightColor
        if (drawing) {
            ctx.picture.lineTo(x,y)
            ctx.picture.stroke()
        }
        
        ctx.cursor.fillStyle = color
        ctx.cursor.strokeStyle = color
        ctx.cursor.clearRect(0, 0, cursorCanvasRef.current.width, cursorCanvasRef.current.height)
        ctx.cursor.beginPath()
        ctx.cursor.arc(x,y,tool !== 'pipett' ? pencilSize/2 : Math.min(size[0], size[1])/100,0,Math.PI*2,false)
        tool === 'pencil' ? ctx.cursor.fill() : ctx.cursor.stroke()
        ctx.cursor.closePath()
    }

    const startDraw = (event) => {
        const x = event.nativeEvent.offsetX*scale[0]
        const y = event.nativeEvent.offsetY*scale[1]
        const button = event.nativeEvent.button
        const ctx = ctxRef.current
        const init = () => {
            const color = button == 0 ? leftColor : rightColor
            ctx.picture.strokeStyle = color
            ctx.picture.fillStyle = color
            ctx.picture.lineWidth = pencilSize
            ctx.picture.lineCap = 'round'
            ctx.picture.beginPath()
            ctx.picture.moveTo(x,y)
            ctx.picture.arc(x,y,pencilSize/2,0,Math.PI*2,false)
            ctx.picture.fill()
            ctx.picture.closePath()
            ctx.picture.beginPath()
            ctx.picture.moveTo(x,y)
            setDrawing(true)
        }
        switch(tool) {
            case 'pencil':
                ctx.picture.globalCompositeOperation='source-over'
                init()
                break
            case 'eraser':
                ctx.picture.globalCompositeOperation='destination-out'
                init()
                break
            case 'pipett':
                const raw_data = ctx.picture.getImageData(x,y,1,1).data
                const red = raw_data[0].toString(16)
                const green = raw_data[1].toString(16)
                const blue = raw_data[2].toString(16)
                const hex = `#${red.length===1?`0${red}`:red}${green.length===1?`0${green}`:green}${blue.length===1?`0${blue}`:blue}`
                button == 0 ? setLeftColor(hex) : setRightColor(hex)
                setTool('pencil')
                break
            default:
                console.log(`Invalid tool: ${tool}`)

        }
    }

    const endDraw = () => {
        const ctx = ctxRef.current
        ctx.picture.closePath()
        setDrawing(false)
        updateEditorState(layerIndex, { src: canvasRef.current.toDataURL(), visible })
    }

    const pauseDraw = () => {
        const ctx = ctxRef.current
        if (drawing) { ctx.picture.closePath() }
        ctx.cursor.clearRect(0, 0, cursorCanvasRef.current.width, cursorCanvasRef.current.height)
    }

    const continueDraw = (event) => {
        const ctx = ctxRef.current
        ctx.picture.beginPath()
    }

    const getCursor = () => {
        switch (tool) {
            case 'pipett':
                return `url('${pipett}') 0 32, auto`
            case 'pencil':
                return `url('${pencil}') 0 32, auto`
            case 'eraser':
                return `url('${eraser}') 0 32, auto`
            default:
                return 'cell'
        }
        
    }

    const editor = {
        border: '1px solid rgba(0,0,0,1)',
        imageRendering: 'pixelated',
        cursor: getCursor(),
        opacity: visible ? 1 : 0,
        gridRowStart: 1,
        gridColumnStart: 1
    }

    return (
        <div style={{ margin: 'auto',  ...style}}>
            <div style={{display: 'grid'}}>
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
                <canvas 
                    ref={ cursorCanvasRef }
                    onContextMenu={ (e) => e.preventDefault()}
                    style={{...editor, pointerEvents: 'none'}}
                />
            </div>
        </div>
    )
}

export default Editor