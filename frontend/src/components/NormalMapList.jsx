import { useSelector } from 'react-redux'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    Button
} from '@mui/material'
import NewNormalMapForm from './NewNormalMapForm'
import { Alert } from '@mui/material'


const NormalMapLink = ({ normalMap }) => {
    const navigate = useNavigate()
    return <Button onClick={() => navigate(`/normal_map/${normalMap.id}`)} data-testid={`normal-map-${normalMap.id}`}>{
        <div style={{ border: '1px solid', borderRadius: 10}}>
            { normalMap.icon ? <img src={normalMap.icon.src}/> : null }
            <div>{ normalMap.name }</div>
        </div>
    }</Button>
}

const NormalMapCategory = ({normalMaps, title, placeholder, ...rest}) => {
    if (normalMaps.length === 0) { 
        return placeholder !== undefined 
            ? (
                <div>
                    <h2>{title}</h2>
                    <Alert severity='info'>{placeholder}</Alert>
                </div>
            )
            : null
    }
    return (
        <div data-testid={rest['data-testid']}>
            <h2>{title}</h2>
            <ul>
                { normalMaps.map((normalMap) => <NormalMapLink key={normalMap.id} normalMap={normalMap} />) }
            </ul> 
        </div>
    )
}

const NormalMapList = ({ user }) => {
    const [open, setOpen] = useState(false)
    const loggedUser = useSelector((state) => state.login)
    const userNormalMaps = useSelector((state) => state.normalMaps).filter(normalMap => user ? normalMap.creator.id === user.id : normalMap.creator.id === loggedUser.id)
    const publicNormalMaps = useSelector((state) => state.normalMaps).filter(normalMap => user ? false : normalMap.creator.id !== loggedUser.id)

    return (
        <div>
            <NormalMapCategory 
                data-testid='user-normal-map-list'
                normalMaps={userNormalMaps}
                title={user === undefined || user.id === loggedUser.id ? 'Your normal maps' : `${user.username}'s normal maps`}
                placeholder={user === undefined || user.id === loggedUser.id ? 'You have not created any normal maps yet.' : `${user.username} has not created any normal maps yet.`}
                />
            <NormalMapCategory
                data-testid='public-normal-map-list'
                normalMaps={publicNormalMaps}
                title={'Public normal maps'}
                />
            { user === undefined || user.id === loggedUser.id ?  <Button variant='outlined' onClick={() => setOpen(true)} data-testid='create-new-button'>Create new</Button> : null }
            <NewNormalMapForm open={open} setOpen={setOpen} />
        </div>
    )
}

export default NormalMapList