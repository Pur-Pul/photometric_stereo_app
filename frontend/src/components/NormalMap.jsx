import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { updateImage } from "../reducers/imageReducer"
import imageService from '../services/images'

const NormalMap = () => {
    const dispatch = useDispatch()
	const id = useParams().id
    const image = useSelector((state) => state.images).find(
		(image) => image.id === id
	)
    
    useEffect(() => {
		const getImage = async () => {
            const data = await imageService.get(id)
            if (data.src != undefined) {
                dispatch(updateImage(data))
            }
        }
        if (image && image.src == undefined) {
            getImage()
        }
	}, [image])

    return (
        image.src != undefined ? <div>{image.src}</div> : <div>Your normal map is being processed...</div>
    )
}

export default NormalMap