import { InputLabel } from "@mui/material"

const LayerSelector = ({ layers, selectedLayer, setSelectedLayer, addLayer, removeLayer, toggleLayer}) => {
    const layerStyle = {
        backgroundColor: '#ffffff',
        border: '2px solid #1ae4f1',
        cursor: 'pointer',
        width: '100%'
    }
    const visibleStyle = {
        width: '20%',
        backgroundColor: '#5da1f6',
        border: '2px solid #1e7cf0ff',
        cursor: 'pointer'
    }
    const removeStyle = {
        width: '20%',
        
        backgroundColor: '#f76a6a',
        border: '2px solid #ff0000',
        cursor: 'pointer'
    }
    return (
        <div style={{ width: '200px' }}>
            <InputLabel htmlFor='layers'>Layers:</InputLabel>
            <div id='layers'>
                <button style={layerStyle} onClick={() => addLayer()}>+</button>
                {
                    layers.slice(0).reverse().map((layer, index) => {
                    return layer 
                    ? <div key={layers.length-1-index} style={{display: 'flex', height: '30px',}}>
                        <button 
                            style={{ ...layerStyle, backgroundColor: selectedLayer === layers.length-1-index ? '#adecf0' : '#ffffff' }}
                            onClick={() => setSelectedLayer(layers.length-1-index)}
                            >
                                {`Layer: ${layers.length-1-index}`}
                        </button>
                        <button style={visibleStyle} onClick={() => toggleLayer(layers.length-1-index)}>{layer.visible ? '👁' : '--'}</button>
                        <button style={removeStyle} onClick={() => removeLayer(layers.length-1-index)}>x</button>
                    </div> 
                    : null
                    })
                }
            </div>
        </div>
    )
}

export default LayerSelector