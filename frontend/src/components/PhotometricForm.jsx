import { useState, useCallback, useEffect } from "react"
import SourceImage from "./SourceImage"
import NameForm from "./NameForm"
import { useDispatch } from "react-redux"
import { generateNormalMap } from "../reducers/normalMapReducer"
import { notificationSet, notificationRemove } from "../reducers/notificationReducer"
import { useSelector } from 'react-redux'
import Mask from "./Mask"
import { useLocation } from "react-router-dom"
import { Button, Grid, TextField, InputLabel, FormControl, Alert } from '@mui/material'

const PhotometricForm = () => {
    const location = useLocation()
    const dispatch = useDispatch()
    const [files, setFiles] = useState([])
    const [mask, setMask] = useState(null)
    const [nameFormOpen, setNameFormOpen] = useState(false)
    const [warning, setWarning] = useState('')

    useEffect(() => {
        let warning = files.length > 0 ? '' : 'No images selected'
        files.forEach(file => {
            warning = file.width == files[0].width && file.height == files[0].height ? warning : 'The images must have equal dimensions.'
            warning = file.src.type == files[0].src.type ? warning : 'The images must be of the same format.'
        })
        setWarning(warning)
    }, [location, files])

    const handleFileSelect = (event) => {
        const fileArray = Array.from(event.target.files)
        const files = []
        for (var i = 0; i < fileArray.length; i++) {
            const file = fileArray[i]
            const image = new Image()
            image.onload = function () {
                files.push({ 
                    image : this.src,
                    src: file,
                    light : [0,0,1],
                    width : this.width,
                    height : this.height
                })
                if (files.length === fileArray.length) { setFiles(files) }
            }
            image.src = URL.createObjectURL(file)
        }
    }

    const submitImages = (event) => {
        event.preventDefault()
        setNameFormOpen(true)
    }

    const handleSave = (event) => {
        event.preventDefault()
        const name = event.target.name.value
        
        dispatch(generateNormalMap(files, mask, name))
            .then(() => { dispatch(notificationSet({ text: `a new image was uploaded`, type: 'success' }, 5)) })
			.catch((exception) => {
				console.log(exception)
				dispatch(notificationSet({ text: exception.response && exception.response.data ? exception.response.data.error : 'An error occured', type: 'error' }, 5))
			})
        setNameFormOpen(false)
    }

    const handleCancel = () => {
        setNameFormOpen(false)
    }
    return (
        <div>
            <h2 data-testid='photometric-title'>Select images:</h2>
            { warning !== '' ? <Alert severity='warning'>{warning}</Alert> : null }
            <form onSubmit={warning === '' ? submitImages : (e) => {
                e.preventDefault()
                false
            }}>
                <Button component='label' variant="outlined">
                    Upload files
                    <input
                        data-testid='photometric-file-upload'
                        style={{ display: 'none' }}
                        type="file"
                        onChange={handleFileSelect}
                        multiple
                    />
                </Button>
                <Button data-testid='photometric-submit' type="submit" color="success" variant="outlined" disabled={warning !== ''}>Submit</Button>
            </form>
            <div>
                <Grid 
                    container
                    spacing={2}
                    direction='columns'
                    > 
                    {
                        files.map((file, index) => <SourceImage key={index} files={files} setFiles={setFiles} index={index} />)
                    }
                </Grid>
            </div>
            <Mask images={files} setMask={setMask}/>
            <NameForm
                open={nameFormOpen}
                handleCancel={handleCancel}
                handleSave={handleSave}
                />
        </div>
    )
}

export default PhotometricForm