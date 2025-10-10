import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { performRemove, performUpdate, reFetchNormalMap, fetchFlatImage } from '../reducers/normalMapReducer'
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
import { useNavigate } from 'react-router-dom'
import NormalMapEditor from './NormalMapEditor'
import Viewer3D from './Viewer3D'

const NormalMap = () => {
    const dispatch = useDispatch()
    const id = useParams().id
    const normalMap = useSelector((state) => state.normalMaps).find((normalMap) => normalMap.id === id)
    const [open, setOpen ] = useState(false)
    const [edit, setEdit] = useState(false)
    const [size, setSize] = useState(null)
    const navigate = useNavigate()
    const [flatImage, setFlatImage] = useState(null)
    const [visibiliy, setVisibility] = useState(normalMap ? normalMap.visibility : 'private')
    const [visAlertOpen, setVisAlertOpen] = useState(false)


    useEffect(() => {
        let updateInterval
        const fetchUpdates = async () => {
            dispatch(reFetchNormalMap(normalMap))
        }
        if (!normalMap) {
            dispatch(reFetchNormalMap({ id }))
            clearInterval(updateInterval)

        } else {
            if (!flatImage) { updateInterval = setInterval(() => fetchUpdates(), 3000) }
            if (normalMap.status === 'done' && !normalMap.flatImage.src) { dispatch(fetchFlatImage(normalMap)) }
            if (normalMap.flatImage && normalMap.flatImage.src) {
                const flatImage = new Image()
                flatImage.onload = function () {
                    const canvas =  document.createElement('canvas')
                    if (!canvas) { return }
                    const size = [this.width, this.height]
                    setSize(size)
                    canvas.width = size[0]
                    canvas.height = size[1]

                    const ctx = canvas.getContext('2d', { willReadFrequently: true })
                    ctx.drawImage(this, 0, 0, this.width, this.height)
                    setFlatImage(this)
                    clearInterval(updateInterval)
                }
                flatImage.src = normalMap.flatImage.src
            }
            setVisibility(normalMap.visibility)
        }

        return () => { clearInterval(updateInterval) }
    }, [normalMap])

    const deleteHandler = async (event) => {
        dispatch(performRemove(id))
        setOpen(false)
        navigate('/normal_map')
    }

    const handleUpdateVisibility = async (vis) => {
        dispatch(performUpdate({ ...normalMap, visibility: vis }))
    }

    if (size && edit) {
        return <NormalMapEditor id={id} size={size} layers={normalMap.layers} handleDiscard={() => setEdit(false)}/> }
    if (!normalMap) { return 'Oops! Normal map does not exist.' }
    if (!flatImage) { return 'Loading' }
    return <div>
        <div>
            <img src={flatImage.src} style={{
                width: '100%',
                maxWidth: '720px',
                height: '100%',
                objectFit: 'cover',
                border: '1px solid rgba(0,0,0,1)',
                imageRendering: 'pixelated',
            }}/>
        </div>
        <Button onClick={() => { setOpen(true) }} variant='outlined' color='error'>Delete</Button>
        <Button type='label' variant='outlined' onClick={() => {
            const link = document.createElement('a')
            link.href = flatImage.src
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