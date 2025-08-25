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
    FormControl,
    IconButton
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

const NewNormalMapForm = ({ open, setOpen }) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [method, setMethod] = useState(null)
    const [width, setWidth] = useState(720)
    const [height, setHeight] = useState(480)
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
                dispatch(notificationSet({ text: 'Method not implemented', type:'error' }, 5))
        }
    }

    const handleClose = () => {
        setOpen(false)
        setMethod(null)
        setWidth(720)
        setHeight(480)
    }
    return <Dialog open={open} closeAfterTransition={false}>
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