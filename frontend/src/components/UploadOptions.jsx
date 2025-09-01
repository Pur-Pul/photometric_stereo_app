import { useEffect } from 'react'
import { 
    TextField,
    Grid
} from '@mui/material'

const UploadOptions = ({normalMap, name, setName, setReady, iconBlob, setIconBlob}) => {
    const img = {
        width: '100%',
        minWidth: '100%',
        height: '100%',
        objectFit: 'cover',
        border: '1px solid rgba(0,0,0,1)',
        imageRendering: 'pixelated',
    }
    const iconCanvas = document.createElement('canvas')
    iconCanvas.width = 64
    iconCanvas.height = 64

    useEffect(() => {
        const image = new Image()
        image.onload = () => {
            const aspect = image.width / image.height
            iconCanvas.width = aspect * 64
            iconCanvas.height = 64
            ctx.drawImage(image, 0, 0, iconCanvas.width, iconCanvas.height)
            iconCanvas.toBlob(blob => setIconBlob(blob))
        }
        image.src = normalMap.src
        const ctx = iconCanvas.getContext('2d', { willReadFrequently: true })
    }, [normalMap])

    useEffect(() => { setReady(name.length > 0 && iconBlob !== undefined && iconBlob !== null) }, [name, iconBlob])
    
    return <Grid container spacing={2}>
        <Grid size={12}>
            <TextField 
                slotProps={{ htmlInput : { 'data-testid': 'upload-name' }}}
                error={name.length<1}
                value={name}
                onChange={(e) => setName(e.target.value)}
                label='Normal map name'
                helperText={name.length<1 ? 'required' : ''}
                />
        </Grid>
        <Grid size={12}>
            <img data-testid='upload-image' style={img} src={ normalMap.src }/>
        </Grid>
    </Grid>
}

export default UploadOptions