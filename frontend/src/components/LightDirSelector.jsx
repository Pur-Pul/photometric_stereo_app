import { useState, useEffect } from 'react'
import LightPlot from './LightPlot'
import Vector3 from '../utils/Vector3'
import {
    TextField,
    Alert,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography
} from '@mui/material'

const LightDirSelector = ({ file, files, setFiles }) => {
    const [open, setOpen] = useState(false)
    const [lightDir, setLightDir] = useState(new Vector3(0,0,0))

    const handleSubmit = (event) => {
        event.preventDefault()
        setOpen(false)

        const new_files = [...files]
        const index = files.findIndex((foundFile) => foundFile.id === file.id)
        new_files[index].light = [lightDir.x, lightDir.y, lightDir.z]
        setFiles(new_files)
    }

    useEffect(() => {
        setLightDir(new Vector3(
            file.light[0],
            file.light[1],
            file.light[2]
        ))
    }, [files, file])

    const handleLightChange = (event) => {
        let tempLight = lightDir.clone()
        switch(event.target.id) {
        case 'lightX':
            tempLight.x = Number(event.target.value)
            break
        case 'lightY':
            tempLight.y = Number(event.target.value)
            break
        case 'lightZ':
            tempLight.z = Number(event.target.value)
            break
        default:
            return
        }
        setLightDir(tempLight)

    }

    useEffect(() => {
        if (document.getElementById('lightX')) { document.getElementById('lightX').value = lightDir.x }
        if (document.getElementById('lightY')) { document.getElementById('lightY').value = lightDir.y }
        if (document.getElementById('lightZ')) { document.getElementById('lightZ').value = lightDir.z }

    }, [lightDir])
    return (
        <div>
            <Button variant="outlined" onClick={() => { setOpen(true) }}>Edit light direction</Button>
            <Dialog open={ open } onClose={() => { setOpen(false) }} closeAfterTransition={false}>
                <DialogTitle>Select light direction</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <Grid container columns={3} spacing={2}>
                            <Grid size={3}>{ lightDir.norm() > 1.00001 || lightDir.norm() < 0.99999 ? <Alert severity='warning'>Vector is not normalized</Alert> : null }</Grid>
                            <Grid size={1}>
                                <TextField
                                    id='lightX'
                                    type="number"
                                    label='X'
                                    error={ lightDir.norm() > 1.00001 || lightDir.norm() < 0.99999 }
                                    defaultValue={ lightDir.x }
                                    slotProps={{ htmlInput : { min:-1, max:1, step: 'any' } }}
                                    onBlur={ handleLightChange }
                                />
                            </Grid>
                            <Grid size={1}>
                                <TextField
                                    id='lightY'
                                    type="number"
                                    label='Y'
                                    error={ lightDir.norm() > 1.00001 || lightDir.norm() < 0.99999 }
                                    defaultValue={ lightDir.y }
                                    slotProps={{ htmlInput : { min:-1, max:1, step: 'any' } }}
                                    onBlur={ handleLightChange }
                                />
                            </Grid>
                            <Grid size={1}>
                                <TextField
                                    id='lightZ'
                                    type="number"
                                    label='Z'
                                    error={ lightDir.norm() > 1.00001 || lightDir.norm() < 0.99999 }
                                    defaultValue={ lightDir.z }
                                    slotProps={{ htmlInput : { min:-1, max:1, step: 'any' } }}
                                    onBlur={ handleLightChange }
                                />
                            </Grid>
                            <Grid size={3}>
                                <Typography>To pick a light direction write the components manually above or click on the blue sphere below.</Typography>
                            </Grid>
                            <Grid size={3}>
                                <LightPlot
                                    file = { file }
                                    lightDir = { lightDir }
                                    setLightDir = { setLightDir }
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={ () => { setOpen(false) } }>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    )
    /*

    */
}

export default LightDirSelector