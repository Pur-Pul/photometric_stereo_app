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
import LayerSelector from "./LayerSelector"

const SIZE_LIMIT = 300

const NormalMapEditor = ({ id, size, layers, handleDiscard }) => {
    const [pencilSize, setPencilSize] = useState(10)
    const [leftColor, setLeftColor] = useState('#000000')
    const [rightColor, setRightColor] = useState('#ffffff')
    const [alertOpen, setAlertOpen] = useState(false)
    const [selectedLayer, setSelectedLayer] = useState(0)
    const [newLayers, setNewLayers] = useState(layers)
    const canvasRefs = Array(5).fill(null).map(() => useRef(null))
    const emptyCanvasRef = useRef(null)
    const dispath = useDispatch()
    const emptyImage = new Image(size[0], size[1])

    useEffect(() => {
        emptyCanvasRef.current = document.createElement('canvas')
        emptyCanvasRef.current.width = size[0]
        emptyCanvasRef.current.height = size[1]
        
        const ctx = emptyCanvasRef.current.getContext('2d')
        ctx.fillStyle = 'rgba(0, 0, 0, 0)'
        ctx.fillRect(0, 0, size[0], size[1])
    }, [])

    const handleSave = () => {
        // TODO
        // Update local normal map with new and updated layers using reducers.
        // Save new layers to backend using image service post.
        // Update exisitng layers in backend using image service put.
        console.log('Save function not yet implemented.')
    }

    const addLayer = () => {
        if (newLayers.length < canvasRefs.length) {
            emptyCanvasRef.current.toBlob((blob) => {
                setNewLayers([...newLayers, {
                    src: URL.createObjectURL(blob)
                }])
            })    
        }
    }

    const removeLayer = (index) => {
        console.log(index)
        if (newLayers.length > 1) {
            console.log(newLayers)
            const clonedNewLayers = [...newLayers]
            clonedNewLayers.splice(index, 1)
            console.log(clonedNewLayers)
            setNewLayers(clonedNewLayers)
            if (newLayers.length-1 < selectedLayer) { setSelectedLayer(newLayers.length-1) }
        }
    }

    return (
        <div style={{ margin: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr' }}>
                {newLayers.map((layer, index) => <Editor 
                    key={index}
                    style={{ pointerEvents: index !== selectedLayer ? 'none' : 'auto', gridRowStart: 1, gridColumnStart: 1}}
                    src={layer.src}
                    pencilSize={pencilSize}
                    leftColor={leftColor}
                    rightColor={rightColor}
                    canvasRef={canvasRefs[index]}
                    />
                )}
            </div>
            <div style={{ alignItems: 'center', display: 'flex', position: 'relative'}}>
                <LayerSelector layers={newLayers} selectedLayer={selectedLayer} setSelectedLayer={setSelectedLayer} addLayer={addLayer} removeLayer={removeLayer}/> 
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