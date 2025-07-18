import { useState, useCallback, useEffect } from "react"
import SourceImage from "./SourceImage"
import { useDispatch } from "react-redux"
import { createImages } from "../reducers/imageReducer"
import { notificationSet, notificationRemove } from "../reducers/notificationReducer"
import { useSelector } from 'react-redux'
import Mask from "./Mask"
import { useLocation } from "react-router-dom"
import Button from '@mui/material/Button'

const ImageUploadForm = () => {
    const location = useLocation()
    const dispatch = useDispatch()
    const [files, setFiles] = useState([])
    const [mask, setMask] = useState(null)
    const notification = useSelector((state) => { return state.notification })

    useEffect(() => {
        dispatch(notificationSet({ text: 'No images selected', type: 'warning' }))
    }, [location])

    const handleFileSelect = (event) => {
        setFiles(Array.from(event.target.files).map((file, index) => {
            return { 
                image : URL.createObjectURL(file),
                src: file,
                light : [0,0,1],
                width : 0,
                height : 0
            }
        }))
    }
    const handleChange = useCallback((new_files) => {
        setFiles([...new_files])
        let status = new_files.length > 0 ? '' : 'No images selected'
        new_files.forEach(file => {
            status = file.width == files[0].width && file.height == files[0].height ? status : 'The images must have equal dimensions.'
            status = file.src.type == files[0].src.type ? status : 'The images must be of the same format.'
        })
        status !== '' ? dispatch(notificationSet({ text: status, type: 'warning' })) : dispatch(notificationRemove())
    }, [files])

    const submitImages = (event) => {
        event.preventDefault()
        console.log(mask)
        dispatch(createImages(files, mask))
            .then(() => { dispatch(notificationSet({ text: `a new image was uploaded`, type: 'message' }, 5)) })
			.catch((exception) => {
				console.log(exception)
				dispatch(notificationSet({ text: exception.response.data.error, type: 'error' }, 5))
			})
    }

    return (
        <div>
            <h2>Select images:</h2>
            <form onSubmit={notification.type !== 'warning' ? submitImages : (e) => {
                e.preventDefault()
                false
            }}>
                <Button component='label' variant="outlined">
                    Upload files
                    <input
                        style={{ display: 'none' }}
                        type="file"
                        onChange={handleFileSelect}
                        onClick={(e) => {dispatch(notificationSet({ text: 'No images selected', type: 'error' }))}}
                        multiple
                    />
                </Button>
                <Button type="submit" variant="outlined">Submit</Button>
            </form>
            <div>
                { files.map((file, index) => <SourceImage key={index} files={files} index={index} handleChange={handleChange}/>) }
            </div>
            <Mask images={files} setMask={setMask}/>
        </div>
    )
}

export default ImageUploadForm