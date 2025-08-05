import { useState, useEffect, useRef } from "react"
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import Button from "@mui/material/Button"
import DialogActions from "@mui/material/DialogActions"
import TextField from "@mui/material/TextField"
import InputLabel from "@mui/material/InputLabel"
import FormControl from "@mui/material/FormControl"
import ColorSelector from "./ColorSelector"
import Editor from "./Editor"
import imageService from "../services/images"

const SIZE_LIMIT = 300

const NormalMapEditor = ({ id, layers, handleDiscard }) => {
    const [pencilSize, setPencilSize] = useState(10)
    const [leftColor, setLeftColor] = useState('#000000')
    const [rightColor, setRightColor] = useState('#ffffff')
    const [alertOpen, setAlertOpen] = useState(false)
    const canvasRefs = Array(layers.length).fill(null).map(() => useRef(null))
    const dispath = useDispatch()

    const handleSave = () => {
        // TODO
        // Update local normal map with new and updated layers using reducers.
        // Save new layers to backend using image service post.
        // Update exisitng layers in backend using image service put.
        console.log('Save function not yet implemented.')
    }

    return (
        <div style={{ margin: 'auto' }}>
            {layers.map((layer, index) => <Editor 
                key={index}
                src={layer.src}
                pencilSize={pencilSize}
                leftColor={leftColor}
                rightColor={rightColor}
                canvasRef={canvasRefs[index]}
                />)}
            <div style={{ alignItems: 'center', display: 'flex'}}>
                <ColorSelector 
                    leftColor={leftColor}
                    rightColor={rightColor}
                    setLeftColor={setLeftColor}
                    setRightColor={setRightColor}
                    />
                
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
                <Button onClick={ () => { setAlertOpen(true) }} color="error" variant="outlined">Cancel</Button>
                <Button onClick={ handleSave } color="success" variant="outlined">Save</Button>
            </div>

            <Dialog open={ alertOpen } onClose={() => { setAlertOpen(false) }} closeAfterTransition={false}>
                <DialogTitle>You are about to discard changes.</DialogTitle>
                <form onSubmit={(event) => {
                    event.preventDefault()
                    setAlertOpen(false)
                    handleDiscard()
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

export default NormalMapEditor