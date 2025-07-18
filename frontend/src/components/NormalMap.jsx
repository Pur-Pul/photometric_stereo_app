import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { performRemove, updateImage } from "../reducers/imageReducer"
import imageService from '../services/images'

const NormalMap = () => {
    const dispatch = useDispatch()
	const id = useParams().id
    const image = useSelector((state) => state.images).find((image) => image.id === id)

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
            dispatch(updateImage({ ...image, src: URL.createObjectURL(blob) }))
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
    }

    return <div>
        {image
        ? (image.src != undefined 
            ? <img style={img} src={image.src} />
            : <div>Your normal map is being processed...</div>
        ): <div>loading...</div>}
        <button onClick={deleteHandler}>Delete</button>
        </div>
}

export default NormalMap