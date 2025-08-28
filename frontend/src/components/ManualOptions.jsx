import { useEffect } from 'react'
import { 
    DialogContentText,
    TextField,
    InputLabel,
    FormControl,
    Grid
} from '@mui/material'

const ManualOptions = ({ width, height, setWidth, setHeight, setReady }) => {
    useEffect(() => {
        if (width > 0 && height > 0) {
            setReady(true)
        } else {
            setReady(false)
        }
    }, [width, height])
    
    return (
        <Grid container spacing={1}>
            <Grid size={12}>
                <DialogContentText style={{paddingBottom: '10px'}}>
                    Select dimensions for the new normal map.
                </DialogContentText>
            </Grid>
            <Grid size={12}>
                <FormControl style={{ width: '20%' }}>
                    <InputLabel htmlFor='width' shrink>Width:</InputLabel>
                    <TextField 
                        id='width'
                        type="number"
                        error={ width <= 0 }
                        helperText={ width <= 0 ? 'too small' : '' }
                        value={ width }
                        slotProps={{ htmlInput : { min:1 }}}
                        onChange={ (e) => setWidth(Number(e.target.value)) }
                    />
                </FormControl>
                <FormControl style={{ width: '20%' }}>
                    <InputLabel htmlFor='height' shrink>Height:</InputLabel>
                    <TextField 
                        id='height'
                        type="number"
                        error={ height <= 0 }
                        helperText= { height <= 0 ? 'too small' : '' }
                        value={ height }
                        slotProps={{ htmlInput : { min:1 }}}
                        onChange={ (e) => setHeight(Number(e.target.value)) }
                    />
                </FormControl>
            </Grid>
        </Grid>
    )
}

export default ManualOptions