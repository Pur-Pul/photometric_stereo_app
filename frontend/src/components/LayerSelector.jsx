const LayerSelector = ({ layers, selectedLayer, setSelectedLayer, addLayer, removeLayer}) => {
    const layerStyle = {
        backgroundColor: '#ffffff',
        border: '2px solid #1ae4f1',
        cursor: 'pointer',
        width: '100%'
    }
    const removeStyle = {
        backgroundColor: '#f76a6a',
        border: '2px solid #ff0000',
        cursor: 'pointer'
    }
    return (
        <div>
            <label>Layers:</label>
            <button style={layerStyle} onClick={() => addLayer()}>+</button>
            {
                layers.slice(0).reverse().map((layer, index) => <div key={layers.length-1-index} style={{display: 'flex'}}>
                    <button 
                        style={{ ...layerStyle, backgroundColor: selectedLayer === layers.length-1-index ? '#adecf0' : '#ffffff' }}
                        onClick={() => setSelectedLayer(layers.length-1-index)}
                        >
                            {`Layer: ${layers.length-1-index}`}
                    </button>
                    <button style={removeStyle} onClick={() => removeLayer(layers.length-1-index)}>-</button>
                </div>)
            }
        </div>
    )
}

export default LayerSelector