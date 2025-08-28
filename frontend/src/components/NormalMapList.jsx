import { useSelector } from 'react-redux'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    Button
} from '@mui/material'
import NewNormalMapForm from './NewNormalMapForm'


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

    return (
        <div>
            {
                normalMaps.length > 0 ? <ul data-testid='normal-map-list'>
                    {normalMaps.map((normalMap) => <NormalMapLink key={normalMap.id} normalMap={normalMap} />)}
                </ul> : <div>You have not created any normal maps yet.</div>
            }
            <Button variant='outlined' onClick={() => setOpen(true)} data-testid='create-new-button'>Create new</Button>
            <NewNormalMapForm open={open} setOpen={setOpen} />
        </div>
    )
}

export default NormalMapList