import { useDispatch, useSelector } from 'react-redux'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

const NormalMapList = () => {
    const normalMaps = useSelector((state) => state.normalMaps)
    console.log(normalMaps)
    return (
        normalMaps.length > 0 ? <ul>
            {normalMaps.map((normalMap) => <li key={normalMap.id}><Link to={ normalMap.id }>{normalMap.id}</Link></li>)}
        </ul> : <div>You have not generated any normal maps yet.</div>   
    )
}

export default NormalMapList