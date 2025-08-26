import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
    Button,
    ButtonGroup,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    DialogContentText,
    Tooltip,
    TextField,
    InputLabel,
    FormControl,
    Grid
} from '@mui/material'

import { notificationSet, notificationRemove } from "../reducers/notificationReducer"
import { performCreate } from '../reducers/normalMapReducer'

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

const UploadOptions = ({normalMap, name, setName, setReady, iconBlob, setIconBlob}) => {
    const img = {
        width: '100%',
        minWidth: '100%',
        height: '100%',
        objectFit: 'cover',
        border: '1px solid rgba(0,0,0,1)'
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

    useEffect(() => { setReady(name.length > 0 && iconBlob) }, [name, iconBlob])
    
    return <Grid container spacing={2}>
        <Grid size={12}>
            <TextField 
                error={name.length<1}
                value={name}
                onChange={(e) => setName(e.target.value)}
                label='Normal map name'
                helperText={name.length<1 ? 'required' : ''}
                />
        </Grid>
        <Grid size={12}>
            <img style={img} src={ normalMap.src }/>
        </Grid>
    </Grid>
}

const NewNormalMapForm = ({ open, setOpen }) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [method, setMethod] = useState(null)
    const [width, setWidth] = useState(720)
    const [height, setHeight] = useState(480)
    const [normalMap, setNormalMap] = useState(null)
    const [name, setName] = useState(null)
    const [ready, setReady] = useState(false)
    const [iconBlob, setIconBlob] = useState(null)
    const handleContinue = () => {
        switch (method) {
            case 'photometric':
                handleClose()
                navigate('/normal_map/photostereo')
                break
            case 'manual':
                setOpen(false)
                navigate(`/normal_map/manual/${width}/${height}`)
                break
            case 'upload':
                dispatch(performCreate([normalMap.file], name, iconBlob, navigate))
                //console.log('Upload function not yet implemented.')
                break
            default:
                dispatch(notificationSet({ text: 'Method not implemented', type:'error' }, 5))
        }
    }

    const handleClose = () => {
        setOpen(false)
        setMethod(null)
        setWidth(720)
        setHeight(480)
    }

    const handleUpload = (e) => {
        const file = e.target.files[0]
        setNormalMap({ src: URL.createObjectURL(file), file })
        setName(file.name.split('.')[0])
        setMethod('upload')
    }
    
    return <Dialog open={open} closeAfterTransition={false}>
                <DialogTitle>New normal map</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <DialogContentText style={{paddingBottom: '10px'}}>
                            Normal maps can be generated using a photometric stereo algorithm or it can be drawn manually. Generated normal maps can also be edited manually afterwards. 
                        </DialogContentText>
                        <ButtonGroup>
                            <Button variant={method === 'photometric' ? 'contained' : 'outlined'} onClick={() => {
                                setReady(true)
                                setMethod(method === 'photometric' ? null : 'photometric')
                            }}>Photometric stereo</Button>
                            <Button variant={method === 'manual' ? 'contained' : 'outlined'} onClick={() => {
                                setReady(false)
                                setMethod(method === 'manual' ? null : 'manual')
                            }}>Manual</Button>
                            <Button component='label' variant={method === 'upload' ? 'contained' : 'outlined'}>
                                Upload
                                <input
                                    hidden
                                    type="file"
                                    onClick={(e) => {
                                        setReady(false)
                                        e.target.value=null
                                    }}
                                    onChange={handleUpload}
                                    />
                            </Button>
                        </ButtonGroup>                        
                        {
                            method === 'manual' 
                                ? <ManualOptions width={width} height={height} setWidth={setWidth} setHeight={setHeight} setReady={setReady}/>
                                : null
                        }
                        {
                            method === 'upload' && normalMap
                                ? <UploadOptions normalMap={normalMap} name={name} setName={setName} setReady={setReady} iconBlob={iconBlob} setIconBlob={setIconBlob}/>
                                : null
                        }
                    </Grid>
                    
                </DialogContent>
                
                <DialogActions>
                    <Button variant='outlined' color='error' onClick={handleClose}>Cancel</Button>
                    <Tooltip title={ method ? '' : 'Select a method to continue' } placement='top'>
                        <span>
                            <Button variant='outlined' disabled={!(method && ready)} onClick={handleContinue}>Continue</Button>
                        </span>
                    </Tooltip> 
                </DialogActions>
            </Dialog>
}

const NormalMapLink = ({ normalMap }) => {
    const navigate = useNavigate()
    return <Button onClick={() => navigate(normalMap.id)}>{
        <div style={{ border: '1px solid', borderRadius: 10}}>
            { normalMap.icon ? <img src={normalMap.icon.src}/> : null }
            <div>{ normalMap.name }</div>
        </div>
    }</Button>
}

const NormalMapList = () => {
    const [open, setOpen] = useState(false)
    const normalMaps = useSelector((state) => state.normalMaps)

    console.log(normalMaps)

    return (
        <div>
            {
                normalMaps.length > 0 ? <ul>
                    {normalMaps.map((normalMap) => <NormalMapLink key={normalMap.id} normalMap={normalMap} />)}
                </ul> : <div>You have not created any normal maps yet.</div>
            }
            <Button variant='outlined' onClick={() => setOpen(true)}>Create new</Button>
            <NewNormalMapForm open={open} setOpen={setOpen} />
        </div>
    )
}

export default NormalMapList