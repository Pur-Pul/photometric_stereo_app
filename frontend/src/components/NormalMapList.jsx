import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'
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
    FormControl
} from '@mui/material'

import { notificationSet, notificationRemove } from "../reducers/notificationReducer"

const ManualOptions = ({width, height, setWidth, setHeight}) => {
    return (
        <div style={{ paddingTop: '10px' }}>
            <DialogContentText style={{paddingBottom: '10px'}}>
                Select dimensions for the new normal map.
            </DialogContentText>
            <FormControl style={{ width: '20%' }}>
                <InputLabel htmlFor='width' shrink>Width:</InputLabel>
                <TextField 
                    id='width'
                    type="number"
                    value={ width }
                    onChange={ (e) => setWidth(Number(e.target.value)) }
                />
                
            </FormControl>
            <FormControl style={{ width: '20%' }}>
                <InputLabel htmlFor='height' shrink>Height:</InputLabel>
                <TextField 
                    id='height'
                    type="number"
                    value={ height }
                    onChange={ (e) => setHeight(Number(e.target.value)) }
                />
            </FormControl>
        </div>
    )
}

const NormalMapList = () => {
    const [open, setOpen] = useState(false)
    const [method, setMethod] = useState(null)
    const [width, setWidth] = useState(720)
    const [height, setHeight] = useState(480)
    const normalMaps = useSelector((state) => state.normalMaps)
    const navigate = useNavigate()
    const dispatch = useDispatch()

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
            default:
                dispatch(notificationSet({text: 'Method not implemented', type:'error'}, 5))
        }
    }

    const handleClose = () => {
        setOpen(false)
        setMethod(null)
        setWidth(720)
        setHeight(480)
    }

    return (
        <div>
            {
                normalMaps.length > 0 ? <ul>
                    {normalMaps.map((normalMap) => <li key={normalMap.id}><Link to={ normalMap.id }>{normalMap.id}</Link></li>)}
                </ul> : <div>You have not created any normal maps yet.</div>
            }
            <Button variant='outlined' onClick={() => setOpen(true)}>Create new</Button>
            <Dialog open={open} closeAfterTransition={false}>
                <DialogTitle>New normal map</DialogTitle>
                <DialogContent>
                    <DialogContentText style={{paddingBottom: '10px'}}>
                        Normal maps can be generated using a photometric stereo algorithm or it can be drawn manually. Generated normal maps can also be edited manually afterwards. 
                    </DialogContentText>
                    <div>
                        <ButtonGroup>
                            <Button variant={method === 'photometric' ? 'contained' : 'outlined'} onClick={() => setMethod(method === 'photometric' ? null : 'photometric')}>Photometric stereo</Button>
                            <Button variant={method === 'manual' ? 'contained' : 'outlined'} onClick={() => setMethod(method === 'manual' ? null : 'manual')}>Manual</Button>
                        </ButtonGroup>
                    </div>
                    {
                        method === 'manual' 
                            ? <ManualOptions width={width} height={height} setWidth={setWidth} setHeight={setHeight}/>
                            : null
                    }
                    
                </DialogContent>
                
                <DialogActions>
                    <Button variant='outlined' color='error' onClick={handleClose}>Cancel</Button>
                    <Tooltip title={ method ? '' : 'Select a method to continue' } placement='top'>
                        <span>
                            <Button variant='outlined' disabled={!method} onClick={handleContinue}>Continue</Button>
                        </span>
                    </Tooltip> 
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default NormalMapList