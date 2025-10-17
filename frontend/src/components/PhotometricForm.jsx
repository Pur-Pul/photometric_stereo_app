import { useState, useEffect } from 'react'
import SourceImage from './SourceImage'
import NameForm from './NameForm'
import { useDispatch } from 'react-redux'
import { generateNormalMap } from '../reducers/normalMapReducer'
import Mask from './Mask'
import { useLocation, useNavigate } from 'react-router-dom'
import {
    Button,
    Grid,
    Select,
    MenuItem,
    Alert
} from '@mui/material'
import { PhotometricStereoDescription } from './FrontPage'

const PhotometricForm = () => {
    const location = useLocation()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [files, setFiles] = useState([])
    const [maskOverlay, setMaskOverlay] = useState(null)
    const [mask, setMask] = useState(null)
    const [nameFormOpen, setNameFormOpen] = useState(false)
    const [warning, setWarning] = useState('')

    useEffect(() => {
        let warning = files.length > 1 ? '' : 'At least two images are required'
        files.forEach(file => {
            warning = file.width === files[0].width && file.height === files[0].height ? warning : 'The images must have equal dimensions.'
            warning = file.src.type === files[0].src.type ? warning : 'The images must be of the same format.'
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
                    width : this.width,
                    height : this.height,
                    light : [0,0,1],
                    id : this.i
                })

                if (files.length === 1) {
                    setMaskOverlay(files[0])
                }
                if (files.length === fileArray.length) {
                    setFiles(sortFiles('nameDesc', files))
                }
            }
            image.i = i
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

        dispatch(generateNormalMap(files, mask, name, navigate))
        setNameFormOpen(false)
    }

    const handleCancel = () => {
        setNameFormOpen(false)
    }

    const sortFiles = (sortBy, files) => {
        const sortedFiles = files.toSorted((a, b) => {
            switch(sortBy) {
            case 'dateDesc':
                return a.src.lastModified < b.src.lastModified ? 1 : -1
            case 'dateAsc':
                return a.src.lastModified > b.src.lastModified ? 1 : -1
            case 'nameDesc':
                return a.src.name > b.src.name ? 1 : -1
            case 'nameAsc':
                return a.src.name < b.src.name ? 1 : -1
            default:
                return a.src.name > b.src.name ? 1 : -1
            }
        })
        return sortedFiles
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
                { files.length > 0
                    ? <Select
                        defaultValue={'nameDesc'}
                        variant='standard'
                        onChange={(e) => setFiles(sortFiles(e.target.value, files))}
                    >
                        <MenuItem value='dateAsc'>Sort by date: Oldest first</MenuItem>
                        <MenuItem value='dateDesc'>Sort by date: Newest first</MenuItem>
                        <MenuItem value='nameDesc'>Sort by name: A-Z</MenuItem>
                        <MenuItem value='nameAsc'>Sort by name: Z-A</MenuItem>
                    </Select>
                    : null
                }
                <Grid
                    container
                    spacing={2}
                    direction='columns'
                >
                    {files.map((file) => {
                        return (
                            <SourceImage
                                key={file.id}
                                files={files}
                                setFiles={setFiles}
                                file={file}
                            />
                        )})}
                </Grid>
            </div>
            <Mask setMask={setMask} maskOverlay={maskOverlay}/>
            <PhotometricStereoDescription />
            <NameForm
                open={nameFormOpen}
                handleCancel={handleCancel}
                handleSave={handleSave}
            />
        </div>
    )
}

export default PhotometricForm