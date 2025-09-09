import { useDispatch } from 'react-redux'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    Button,
    ButtonGroup,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    DialogContentText,
    Tooltip,
    Grid
} from '@mui/material'

import { notificationSet } from "../reducers/notificationReducer"
import { performCreate } from '../reducers/normalMapReducer'
import ManualOptions from './ManualOptions'
import UploadOptions from './UploadOptions'

const NewNormalMapForm = ({ open, setOpen }) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [method, setMethod] = useState(null)
    const [width, setWidth] = useState(720)
    const [height, setHeight] = useState(480)
    const [normalMap, setNormalMap] = useState(null)
    const [name, setName] = useState(null)
    const [ready, setReady] = useState(false)
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
                dispatch(performCreate([normalMap.file], name, navigate))
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
        let name = file.name.split('.')
        name.pop()
        setName(name.join('.'))
        setMethod('upload')
    }
    
    return <Dialog open={open} closeAfterTransition={false} data-testid='normal-map-form'>
                <DialogTitle>New normal map</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <DialogContentText style={{paddingBottom: '10px'}} data-testid='form-description'>
                            Normal maps can be generated using a photometric stereo algorithm or it can be drawn manually. Generated normal maps can also be edited manually afterwards. 
                        </DialogContentText>
                        <ButtonGroup data-testid='form-option-buttons'>
                            <Button 
                                variant={method === 'photometric' ? 'contained' : 'outlined'}
                                data-testid='button-photometric'
                                onClick={() => {
                                    setReady(true)
                                    setMethod(method === 'photometric' ? null : 'photometric')
                                }}
                                >Photometric stereo</Button>
                            <Button
                                variant={method === 'manual' ? 'contained' : 'outlined'}
                                data-testid='button-manual'
                                onClick={() => {
                                    setReady(false)
                                    setMethod(method === 'manual' ? null : 'manual')
                                }}
                                >Manual</Button>
                            <Button 
                                component='label'
                                variant={method === 'upload' ? 'contained' : 'outlined'}
                                data-testid='button-upload'>
                                Upload
                                <input
                                    hidden
                                    type="file"
                                    data-testid='file-upload'
                                    onClick={(e) => {
                                        setReady(false)
                                        e.target.value=''
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
                                ? <UploadOptions normalMap={normalMap} name={name} setName={setName} setReady={setReady} />
                                : null
                        }
                    </Grid>
                    
                </DialogContent>
                
                <DialogActions>
                    <Button variant='outlined' color='error' data-testid='form-cancel' onClick={handleClose}>Cancel</Button>
                    <Tooltip title={ method ? '' : 'Select a method to continue' } placement='top'>
                        <span>
                            <Button variant='outlined' disabled={!(method && ready)} data-testid='form-continue' onClick={handleContinue}>Continue</Button>
                        </span>
                    </Tooltip> 
                </DialogActions>
            </Dialog>
}

export default NewNormalMapForm