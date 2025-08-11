import { useState, useRef, useEffect } from "react"
import { 
    InputLabel,
    Dialog,
    DialogTitle,
    DialogActions,
    Button,
    IconButton,
    Grid,
    Tooltip
} from "@mui/material"
import normal_sphere from '../static/normal_sphere.png'
import pipett from '../static/pipett32.png'

const ColorWheel = ({currentColor, saveColor, setOpen}) => {
    const canvasRef = useRef(null)
    const ctxRef = useRef(null)
    const [color, setColor] = useState(currentColor)
    const image = new Image()
    image.onload = () => {
        const canvas = canvasRef.current
        canvas.width = image.width
        canvas.height = image.height
        ctxRef.current = canvas.getContext('2d', { willReadFrequently: true })
        ctxRef.current.drawImage(image, 0, 0, image.width, image.height)
    }
    image.src = normal_sphere
    const getColor = (event) => {
        const {offsetX:x, offsetY:y} = event.nativeEvent
        const raw_data = ctxRef.current.getImageData(x,y,1,1).data

        const red = raw_data[0].toString(16)
        const green = raw_data[1].toString(16)
        const blue = raw_data[2].toString(16)
        const hex = `#${red.length===1?`0${red}`:red}${green.length===1?`0${green}`:green}${blue.length===1?`0${blue}`:blue}`
        setColor(hex)
    }
    console.log(pipett)
    return (
        <div style={{textAlign: 'center'}}>
            <canvas style={{border: '2px solid', cursor: `url('${pipett}') 0 32, auto`}} ref={canvasRef} onMouseDown={getColor}/>
            <DialogActions>
                <InputLabel htmlFor="chosenColor">{color}</InputLabel>
                <input
                    id="chosenColor"
                    style={{border: '1px solid #000000', padding: '8px 16px', backgroundColor: color, color: color}}
                    type="button"
                    />
                <Button variant='outlined' color='error' onClick={() => setOpen(false)}>Cancel</Button>
                <Button variant='outlined' onClick={() => {
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
        cursor: 'pointer',
        borderRadius: '5px'
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
            <div>
                <InputLabel htmlFor="selector">Color: </InputLabel>
                <div id="selector">
                    <Tooltip title={leftColor} placement='top'>
                        <input 
                            style={{...colorButton, backgroundColor: leftColor, color: leftColor}}
                            type="button"
                            onClick={() => setOpen("left")}
                            />
                    </Tooltip>
                    <input 
                        style={arrowButton}
                        type="button"
                        value="⇆"
                        onClick={handleSwitch}
                        />
                    <Tooltip title={rightColor} placement='top'>
                        <input 
                            style={{...colorButton, backgroundColor: rightColor, color: rightColor }}
                            className="colorButton"
                            type="button"
                            onClick={() => setOpen("right")}
                            />
                    </Tooltip>
                    
                </div>
            </div>
            <Dialog open={open==="left" || open==="right"} onClose={() => setOpen("")} closeAfterTransition={false} fullWidth maxWidth = 'xs'>
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