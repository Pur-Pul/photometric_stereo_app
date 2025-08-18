import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { performRemove, updateNormalMap } from "../reducers/normalMapReducer"
import imageService from '../services/images'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
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

    useEffect(() => {
        const getNormalMap = async() => {
            const newNormalMap = await imageService.get(id)
            newNormalMap.layers = newNormalMap.layers.map(id => {return{id}})
            if (newNormalMap.icon) {
                const iconBlob = await imageService.getFile(newNormalMap.icon)
                newNormalMap.icon = { id: newNormalMap.icon, src: URL.createObjectURL(iconBlob) }
            }
            
            if (newNormalMap.layers.length != normalMap.layers.length || newNormalMap.status != normalMap.status) {
                dispatch(updateNormalMap(newNormalMap))
            }
        }
		const getLayers = async () => {
            const updatedLayers = []
            for (var i = 0; i < normalMap.layers.length; i++) {
                const blob = await imageService.getFile(normalMap.layers[i].id)
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
        
	}, [normalMap])

    useEffect(() => {
        layers.forEach((layer, index) => {
            const image = new Image()
            image.onload = function() {
                const canvas = canvasRef.current
                if (!canvas) { return }
                if (index === 0) {
                    const size = [this.width, this.height]
                    setSize(size)
                    canvas.width = size[0]
                    canvas.height = size[1]
                }
                const ctx = canvas.getContext('2d', { willReadFrequently: true })
                ctx.drawImage(this, 0, 0, this.width, this.height)
            }
            image.src = layer.src
        })
    }, [layers, edit])
 
    const deleteHandler = async (event) => {
        dispatch(performRemove(id))
        setOpen(false) 
        navigate('/normal_map')
    }

    if (size && edit) return <NormalMapEditor id={id} size={size} layers={normalMap.layers} handleDiscard={() => setEdit(false)}/>

    return normalMap && normalMap.layers.length > 0
        ? (normalMap.layers[0].src != undefined 
            ? <div>
                <canvas ref={canvasRef} style={{ border: '1px solid', width: '100%', height:'100%' }}/><br />
                <Viewer3D />
                <Button onClick={() => { setOpen(true) }} variant='outlined' color='error'>Delete</Button>
                <Button type='label' variant='outlined' onClick={() => {
                    const link = document.createElement("a")
                    link.href = canvasRef.current.toDataURL()
                    link.download = 'normalmap.png'
                    link.click()
                }}>Download</Button>
                <Button onClick={() => setEdit(true)} variant='outlined'>Edit</Button>
                <Dialog open={open} onClose={ () => setOpen(false) } closeAfterTransition={false}>
                    <DialogTitle>Are you sure you want to delete the normal map?</DialogTitle>
                    <DialogActions>
                        <Button onClick={ () => setOpen(false) } variant='outlined'>Cancel</Button>
                        <Button onClick={deleteHandler} variant='outlined' color='error'>Delete</Button>
                    </DialogActions>
                </Dialog>
                
            </div>
            : <div>Your normal map is being processed...</div>
        ): <div>loading...</div>
}

export default NormalMap