import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    Button,
    Grid
} from '@mui/material'
import NewNormalMapForm from './NewNormalMapForm'
import { Alert } from '@mui/material'
import { fetchPage } from '../reducers/normalMapReducer'


const NormalMapLink = ({ normalMap }) => {
    const navigate = useNavigate()
    return (
        <Button 
            onClick={() => navigate(`/normal_map/${normalMap.id}`)}
            data-testid={`normal-map-${normalMap.id}`}
            variant='outlined'
            >
            <div>
                { normalMap.icon ? <img src={normalMap.icon.src}/> : null }
                <div>{ normalMap.name }</div>
            </div>
        </Button>
    )
}

const NormalMapCategory = ({normalMaps, title, placeholder, category, children, ...rest}) => {
    const dispatch = useDispatch()

    if (normalMaps.length === 0) { 
        return placeholder !== undefined 
            ? (
                <div>
                    <h2>{title}</h2>
                    <Alert severity='info'>{placeholder}</Alert>
                    {children}
                </div>
            )
            : null
    }

    const handleLoad = () => { dispatch(fetchPage(Math.floor(normalMaps.length/10)+1, category)) }

    return (
        <Grid 
            data-testid={rest['data-testid']}
            container spacing={2}
            direction='columns'
            sx={{alignItems: 'center',
            border: 'solid 2px #2196f3 ',
            margin: '2%',
            padding: '2%',
            borderRadius: 5}}
            >
            <Grid size={12}><h2>{title}</h2></Grid>
                { normalMaps.map((normalMap) => <NormalMapLink key={normalMap.id} normalMap={normalMap} />) }
            <Grid container size={12}>
                <Button variant='outlined' onClick={handleLoad}>Load more</Button>
                {children}
            </Grid>
            
        </Grid>
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
                category='private'
                >
                { user === undefined || user.id === loggedUser.id ?  <Button variant='outlined' onClick={() => setOpen(true)} data-testid='create-new-button'>Create new</Button> : null }
            </NormalMapCategory>
            
            <NormalMapCategory
                data-testid='public-normal-map-list'
                normalMaps={publicNormalMaps}
                title={'Public normal maps'}
                category='public'
                />
            
            <NewNormalMapForm open={open} setOpen={setOpen} />
        </div>
    )
}

export default NormalMapList