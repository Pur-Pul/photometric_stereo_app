import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { performRemove, updateNormalMap, performUpdate } from "../reducers/normalMapReducer"
import imageService from '../services/images'
import { 
    Button,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    Select,
    MenuItem,
    InputLabel,
    FormControl
} from '@mui/material'
import { useNavigate} from 'react-router-dom'
import NormalMapEditor from './NormalMapEditor'
import Viewer3D from './Viewer3D'

const NormalMap = () => {
    const dispatch = useDispatch()
	const id = useParams().id
    const normalMap = useSelector((state) => state.normalMaps).find((normalMap) => normalMap.id === id)
    const [open, setOpen ] = useState(false)
    const [edit, setEdit] = useState(false)
    const [size, setSize] = useState(null)
    const [layers, setLayers] = useState([]) 
    const navigate = useNavigate()
    const canvasRef = useRef(null)
    const [flatImage, setFlatImage] = useState(null)
    const [visibiliy, setVisibility] = useState(normalMap ? normalMap.visibility : 'private')
    const [visAlertOpen, setVisAlertOpen] = useState(false)

    useEffect(() => {
        const getNormalMap = async () => {
            const newNormalMap = await imageService.get(id)
            newNormalMap.layers = newNormalMap.layers.map(id => {return{id}})
            if (newNormalMap.icon) {
                const iconBlob = await imageService.getFile(id, newNormalMap.icon)
                newNormalMap.icon = { id: newNormalMap.icon, src: URL.createObjectURL(iconBlob) }
            }
            
            if (newNormalMap.layers.length != normalMap.layers.length || newNormalMap.status != normalMap.status) {
                dispatch(updateNormalMap(newNormalMap))
            }
        }
		const getLayers = async () => {
            const updatedLayers = []
            for (var i = 0; i < normalMap.layers.length; i++) {
                const blob = await imageService.getFile(id, normalMap.layers[i].id)
                updatedLayers.push({...normalMap.layers[i], src:URL.createObjectURL(blob)})
            }
            
            dispatch(updateNormalMap({ ...normalMap, layers: updatedLayers }))
        }
        if (!normalMap) { return }
        if (normalMap.status == 'done' && normalMap.layers[0].src == undefined) {
            getLayers()
        } else {
            getNormalMap()
        }
        if (normalMap.layers && normalMap.layers.length) {
            setLayers(normalMap.layers)
        }
        setVisibility(normalMap.visibility)
	}, [normalMap])

    useEffect(() => {
        for (var i = 0; i < layers.length; i++) {
            const layer = layers[i]
            if (!layer.src) { continue }
            const image = new Image()
            image.onload = function () {
                const canvas = canvasRef.current
                if (!canvas) { return }
                if (this.i === 0) {
                    const size = [this.width, this.height]
                    setSize(size)
                    canvas.width = size[0]
                    canvas.height = size[1]
                }
                const ctx = canvas.getContext('2d', { willReadFrequently: true })
                ctx.drawImage(this, 0, 0, this.width, this.height)
                if (this.i === layers.length-1) {
                    const flatImage = new Image()
                    flatImage.onload = function() { setFlatImage(this) }
                    flatImage.src = canvas.toDataURL()
                }
            }
            image.i = i
            image.src = layer.src
        }
        
    }, [layers, edit])
 
    const deleteHandler = async (event) => {
        dispatch(performRemove(id))
        setOpen(false) 
        navigate('/normal_map')
    }

    const handleUpdateVisibility = async (vis) => {
        dispatch(performUpdate({...normalMap, visibility: vis}))
    }

    if (size && edit) return <NormalMapEditor id={id} size={size} layers={normalMap.layers} handleDiscard={() => setEdit(false)}/>

    return <div>
                <canvas ref={canvasRef} style={{ border: '1px solid', width: '100%', height:'100%', imageRendering: 'pixelated' }}/>
                
                <Button onClick={() => { setOpen(true) }} variant='outlined' color='error'>Delete</Button>
                <Button type='label' variant='outlined' onClick={() => {
                    const link = document.createElement("a")
                    link.href = canvasRef.current.toDataURL()
                    link.download = 'normalmap.png'
                    link.click()
                }}>Download</Button>
                <Button onClick={() => setEdit(true)} variant='outlined'>Edit</Button>
                <FormControl>
                <InputLabel id="visibility">Visibility</InputLabel>
                    <Select
                        labelId='visibility'
                        value={visibiliy}
                        label='Visibility'
                        onChange={(e) => { e.target.value === 'public' ? setVisAlertOpen(true) : handleUpdateVisibility(e.target.value) }}
                        >
                        <MenuItem value='private'>Private</MenuItem>
                        <MenuItem value='public'>Public</MenuItem>
                    </Select>
                </FormControl>
                { flatImage ? <Viewer3D image={flatImage} /> : null }
                <Dialog open={open} onClose={ () => setOpen(false) } closeAfterTransition={false}>
                    <DialogTitle>Are you sure you want to delete the normal map?</DialogTitle>
                    <DialogActions>
                        <Button onClick={ () => setOpen(false) } variant='outlined'>Cancel</Button>
                        <Button onClick={deleteHandler} variant='outlined' color='error'>Delete</Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={visAlertOpen} closeAfterTransition={false}>
                    <DialogTitle>Are you sure you want to make the normal map public?</DialogTitle>
                    <DialogContent>
                        Any registered user will be able to see and use your normal map.
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={ () => setVisAlertOpen(false) } variant='outlined' color='error'>Cancel</Button>
                        <Button onClick={() => {
                            handleUpdateVisibility('public')
                            setVisAlertOpen(false)
                        }} variant='outlined' color='success'>Accept</Button>
                    </DialogActions>
                </Dialog>
            </div>
         
}

export default NormalMap