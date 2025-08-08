import { useState, useEffect, useRef } from "react"
import pipett from '../static/pipett32.png'

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
        if (firstLoad) {
            if (Math.max(imageSize[0], imageSize[1]) > SIZE_LIMIT) {
                canvas.width = canvasAspect >= 1 ? SIZE_LIMIT : canvasAspect * SIZE_LIMIT
                canvas.height = canvasAspect >= 1 ? SIZE_LIMIT / canvasAspect : SIZE_LIMIT
            } else {
                canvas.width = imageSize[0]
                canvas.height = imageSize[1]
            }
        }
        canvas.style.width = `${canvasSize[0]-2}px`
        canvas.style.height = `${canvasSize[1]-2}px`
        setScale([canvas.width/canvasSize[0], canvas.height/canvasSize[1]])
    }

    const image = new Image()
    image.onload = () => {
        if (firstLoad) {
            setFirstLoad(false)
            const size = [image.width,image.height]
            setSize(size)
            const canvas = canvasRef.current
            ctxRef.current = canvas.getContext('2d', { willReadFrequently: true })

            calculateCanvasSize(size, [window.innerWidth, window.innerHeight * 0.8]) 

            ctxRef.current.drawImage(image, 0, 0, canvasRef.current.width, canvasRef.current.height)
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
        if (tool === 'pencil') {
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
        } else if (tool === 'pipett') {
            const raw_data = ctxRef.current.getImageData(x,y,1,1).data

            const red = raw_data[0].toString(16)
            const green = raw_data[1].toString(16)
            const blue = raw_data[2].toString(16)
            const hex = `#${red.length===1?`0${red}`:red}${green.length===1?`0${green}`:green}${blue.length===1?`0${blue}`:blue}`
            button == 0 ? setLeftColor(hex) : setRightColor(hex)
            setTool('pencil')
        }
    }

    const endDraw = () => {
        ctxRef.current.closePath()
        setDrawing(false)
        updateEditorState(layerIndex, { src: canvasRef.current.toDataURL(), visible })
    }

    const pauseDraw = () => {
        if (drawing) { ctxRef.current.closePath() }
    }

    const continueDraw = (event) => {
        ctxRef.current.beginPath()
    }

    const getCursor = () => {
        switch (tool) {
            case 'pipett':
                return `url('${pipett}') 0 32, auto`
            default:
                return 'cell'
        }
        
    }

    console.log(visible)

    const editor = {
        border: '1px solid rgba(0,0,0,1)',
        imageRendering: 'pixelated',
        cursor: getCursor(),
        opacity: visible ? 1 : 0
    }

    return (
        <div style={{ margin: 'auto',  ...style}}>
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