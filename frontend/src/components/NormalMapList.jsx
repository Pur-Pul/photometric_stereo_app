import { useDispatch, useSelector } from 'react-redux'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

const NormalMapList = () => {
    const images = useSelector((state) => state.images)
    return (
        images.length > 0 ? <ul>
            {images.map((image) => <li key={image.id}><Link to={ image.id }>{image.id}</Link></li>)}
        </ul> : <div>You have not generated any normal maps yet.</div>   
    )
}

export default NormalMapList