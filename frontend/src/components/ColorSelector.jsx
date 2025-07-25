import { useState, useRef, useEffect } from "react"
import { InputLabel, Dialog, DialogTitle, DialogActions, Button } from "@mui/material"

const ColorWheel = ({currentColor, saveColor, setOpen}) => {
    const canvasRef = useRef(null)
    const ctxRef = useRef(null)
    const [color, setColor] = useState(currentColor)
    useEffect(() => {
        const canvas = canvasRef.current
        ctxRef.current = canvas.getContext('2d', { willReadFrequently: true })
    }, [])
    const getColor = (event) => {
        const {offsetX:x, offsetY:y} = event.nativeEvent
        const raw_data = ctxRef.current.getImageData(x,y,1,1).data
        setColor(`rgba(${raw_data[0]},${raw_data[1]},${raw_data[2]},${raw_data[3]})`)
    }
    return (
        <div>
            <canvas ref={canvasRef} onMouseDown={getColor}/> 
            <DialogActions>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                    saveColor(color)
                    setOpen(false)
                }}>Save</Button>
            </DialogActions>
        </div>
    )
}

const ColorSelector = ({ leftColor, rightColor, setLeftColor, setRightColor }) => {
    const [open, setOpen] = useState("")
    
    const colorButton = {
        border: '1px solid #000000',
        padding: '8px 16px',
        cursor: 'pointer'
    }

    const arrowButton = {
        border: 'none',
        backgroundColor: 'rgba(0,0,0,0)' ,
        fontSize: '16px',
        cursor: 'pointer'
    }

    const handleSwitch = () => {
        const temp = leftColor
        setLeftColor(rightColor)
        setRightColor(temp)
    }

    return (
        <div>
            <InputLabel htmlFor="selector">Color: </InputLabel>
            <div id="selector">
                <input 
                    style={{...colorButton, backgroundColor: leftColor, color: leftColor}}
                    type="button"
                    onClick={() => setOpen("left")}
                    />
                <input 
                    style={arrowButton}
                    type="button"
                    value="⇆"
                    onClick={handleSwitch}
                    />
                <input 
                    style={{...colorButton, backgroundColor: rightColor, color: rightColor }}
                    className="colorButton"
                    type="button"
                    onClick={() => setOpen("right")}
                    />
            </div>
            <Dialog open={open==="left" || open==="right"} onClose={() => setOpen("")} closeAfterTransition={false}>
                <DialogTitle>Pick a color</DialogTitle>
                <ColorWheel 
                    currentColor={ open==="left" ? leftColor : rightColor }
                    saveColor={ open==="left" ? setLeftColor : setRightColor }
                    setOpen={ setOpen }
                    />
            </Dialog>
        </div>
    )
}

export default ColorSelector