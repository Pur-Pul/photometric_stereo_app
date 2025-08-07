import { useParams } from 'react-router-dom'
import NormalMapEditor from './NormalMapEditor'

const ManualCreation = () => {
    const { width, height } = useParams()
  
    return !(isNaN(width) || isNaN(height)) 
        ? <NormalMapEditor size={[Number(width), Number(height)]} layers={[]} handleDiscard={() => {}}/>
        : null
}

export default ManualCreation