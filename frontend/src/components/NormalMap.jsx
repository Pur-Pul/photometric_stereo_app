import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { performRemove, updateNormalMap } from "../reducers/normalMapReducer"
import imageService from '../services/images'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import { useNavigate} from 'react-router-dom'
import NormalMapEditor from './NormalMapEditor'

const NormalMap = () => {
    const dispatch = useDispatch()
	const id = useParams().id
    const normalMap = useSelector((state) => state.normalMaps).find((normalMap) => normalMap.id === id)
    const [open, setOpen ] = useState(false)
    const [edit, setEdit] = useState(false)
    const [size, setSize] = useState(null)
    const navigate = useNavigate()

    const img = {
        width: '100%',
        minWidth: '100%',
        height: '100%',
        objectFit: 'cover',
        border: '1px solid rgba(0,0,0,1)'
    }
    useEffect(() => {
        const getNormalMap = async() => {
            const newNormalMap = await imageService.get(id)
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
        if (normalMap) {
            console.log(normalMap)
            if (normalMap.status == 'done' && normalMap.layers[0].src == undefined) {
                getLayers()
            } else {
                getNormalMap()
            }
        }
	}, [normalMap])
    const deleteHandler = async (event) => {
        dispatch(performRemove(id))
        setOpen(false)
        navigate('/normal_map')
    }

    if (size && edit) return <NormalMapEditor id={id} size={size} layers={normalMap.layers} handleDiscard={() => setEdit(false)}/>

    return normalMap && normalMap.layers.length > 0
        ? (normalMap.layers[0].src != undefined 
            ? <div>
                <img style={img} src={normalMap.layers[0].src} onLoad={(e) => {setSize([e.target.naturalWidth, e.target.naturalHeight])}}/>
                <Button onClick={() => { setOpen(true) }} variant='outlined' color='error'>Delete</Button>
                <Button type='label' variant='outlined'>
                    <a href={normalMap.layers[0].src} download={`normalmap.png`} style={{ visibility: 'none' }}>
                        Download
                    </a>
                </Button>
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