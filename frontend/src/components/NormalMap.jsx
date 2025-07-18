import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { performRemove, updateImage } from "../reducers/imageReducer"
import imageService from '../services/images'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'

const NormalMap = () => {
    const dispatch = useDispatch()
	const id = useParams().id
    const image = useSelector((state) => state.images).find((image) => image.id === id)
    const [open, setOpen ] = useState(false)

    const img = {
        width: '100%',
        minWidth: '100%',
        height: '100%',
        objectFit: 'cover',
        border: '1px solid rgba(0,0,0,1)'
    }
    
    useEffect(() => {
        const getImage = async() => {
            const new_image = await imageService.get(id)
            if (JSON.stringify(new_image) !== JSON.stringify(image)) {
                dispatch(updateImage(new_image))
            }
        }
		const getImageFile = async () => {
            const blob = await imageService.getFile(id)
            dispatch(updateImage({ ...image, src: URL.createObjectURL(blob)}))
        }
        if (image && image.src == undefined) {
            if (image.status == 'done') {
                getImageFile()
            } else {
                getImage()
            }
        }
	}, [image])
    const deleteHandler = async (event) => {
        dispatch(performRemove(id))
        setOpen(false)
    }

    return image
        ? (image.src != undefined 
            ? <div>
                <img style={img} src={image.src} />
                <Button onClick={() => { setOpen(true) }} variant='outlined' color='error'>Delete</Button>
                <Button type='label' variant='outlined'>
                    <a href={image.src} download={image.file+image.format} style={{ visibility: 'none' }}>
                        Download
                    </a>
                </Button>
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