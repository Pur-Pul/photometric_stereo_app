import { useEffect } from 'react'
import {
    TextField,
    Grid
} from '@mui/material'

const UploadOptions = ({ normalMap, name, setName, setReady }) => {
    const img = {
        width: '100%',
        minWidth: '100%',
        height: '100%',
        objectFit: 'cover',
        border: '1px solid rgba(0,0,0,1)',
        imageRendering: 'pixelated',
    }


    useEffect(() => { setReady(name.length > 0) }, [name, setReady])

    return <Grid container spacing={2}>
        <Grid size={12}>
            <TextField
                slotProps={{ htmlInput : { 'data-testid': 'upload-name' } }}
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