import { useDispatch, useSelector } from 'react-redux'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

const NormalMapList = () => {
    const images = useSelector((state) => state.images)
    console.log(images)
    return images.length > 0 ? images.map((image) => 
        <Link to={ image.id } key={image.id}>{image.id}</Link>
    ) : <div>You have not generated any normal maps yet.</div>
}

export default NormalMapList