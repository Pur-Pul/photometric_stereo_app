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
import pipette from '../static/pipette32.png'

const ColorWheel = ({currentColor, saveColor, setOpen}) => {
    const canvasRef = useRef(null)
    const [color, setColor] = useState(currentColor)
    const image = new Image()
  
    image.onload = () => {
        const canvas = canvasRef.current
        canvas.width = image.width
        canvas.height = image.height
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(image, 0, 0, image.width, image.height)
    }
    image.src = normal_sphere
    

    const getColor = (event) => {
        const {offsetX:x, offsetY:y} = event.nativeEvent
        const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true })
        const raw_data = ctx.getImageData(x,y,1,1).data
        console.log(x,y)

        const red = raw_data[0].toString(16)
        const green = raw_data[1].toString(16)
        const blue = raw_data[2].toString(16)
        const hex = `#${red.length===1?`0${red}`:red}${green.length===1?`0${green}`:green}${blue.length===1?`0${blue}`:blue}`
        setColor(hex)
    }
        console.log('here')
    return (
        <div style={{textAlign: 'center'}} data-testid='color-wheel'>
            <canvas data-testid='color-wheel-canvas' style={{border: '2px solid', cursor: `url('${pipette}') 0 32, auto`}} ref={canvasRef} onMouseDown={getColor}/>
            <DialogActions>
                <InputLabel htmlFor="chosenColor">{color}</InputLabel>
                <input
                    id="chosenColor"
                    style={{border: '1px solid #000000', padding: '8px 16px', backgroundColor: color, color: color}}
                    type="button"
                    />
                <Button data-testid='cancel-color' variant='outlined' color='error' onClick={() => setOpen(false)}>Cancel</Button>
                <Button data-testid='save-color' variant='outlined' onClick={() => {
                    saveColor(color)
                    setOpen(false)
                }}>Save</Button>
            </DialogActions>
        </div>
    )
}

const ColorSelector = ({ leftColor, rightColor, setLeftColor, setRightColor, enableColorWheel=true }) => {
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
                <InputLabel htmlFor="selector" data-testid='color-title'>Color: </InputLabel>
                <div >
                    {
                        leftColor 
                            ? <Tooltip title={leftColor} placement='top'>
                                <input
                                    data-testid='pick-left'
                                    id="selector"
                                    style={{...colorButton, backgroundColor: leftColor, color: leftColor}}
                                    type="button"
                                    onClick={() => setLeftColor ? setOpen("left") : null}
                                    />
                            </Tooltip>
                            : null
                    }
                    {
                        rightColor && leftColor && setLeftColor && setRightColor
                            ? <input
                                data-testid='color-switcher'
                                style={arrowButton}
                                type="button"
                                value="⇆"
                                onClick={handleSwitch}
                                />
                            : null
                    }
                    {
                        rightColor 
                            ? <Tooltip title={rightColor} placement='top'>
                                <input
                                    data-testid='pick-right'
                                    style={{...colorButton, backgroundColor: rightColor, color: rightColor }}
                                    className="colorButton"
                                    type="button"
                                    onClick={() => setRightColor ? setOpen("right") : null}
                                    />
                            </Tooltip>
                            : null
                    }
                </div>
            </div>
            <Dialog open={enableColorWheel && (open==="left" || open==="right")} onClose={() => setOpen("")} closeAfterTransition={false} fullWidth maxWidth = 'xs'>
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