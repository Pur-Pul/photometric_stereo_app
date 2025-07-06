import { useState } from "react"
import SourceImage from "./SourceImage"
import { useDispatch } from "react-redux"
import { createImage } from "../reducers/imageReducer"

const ImageUploadForm = () => {
    const dispatch = useDispatch()
    const [files, setFiles] = useState([])    
    const handleChange = (event) => {
        console.log(event.target.files)
        setFiles(Array.from(event.target.files).map((file) => {
            return { 
                image : URL.createObjectURL(file),
                src: file,
                light : [0,0,1]
            }
        }))
    }
    const submitImages = (event) => {
        event.preventDefault()
        
        dispatch(createImage(files[0].src))
            .then(() => {
				dispatch(
					notificationSet(
						{
							text: `a new image was uploaded`,
							type: 'message',
						},
						5
					)
				)
			})
			.catch((exception) => {
				console.log(exception)
				dispatch(
					notificationSet(
						{
							text: exception.response.data.error,
							type: 'error',
						},
						5
					)
				)
			})
    }
    return (
        <div>
            <h2>Select images:</h2>
            <form onSubmit={submitImages}>
                <input type="file" onChange={handleChange} multiple/>
                <input type="submit" />
            </form>
            <ul>
                { files.map((file, index) => <li key={index}><SourceImage files={files} setFiles={setFiles} index={index}/></li>) }
            </ul>
        </div>
    )
}

export default ImageUploadForm