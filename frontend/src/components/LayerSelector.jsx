import { 
    InputLabel, 
    Button,
    ButtonGroup, 
} from "@mui/material"

const LayerSelector = ({ layers, selectedLayer, setSelectedLayer, addLayer, removeLayer, toggleLayer}) => {
    const layerStyle = {
        width: '100%',
        height: '30px',
        //backgroundColor: '#ffffff',
        //border: '2px solid #1ae4f1',
        cursor: 'pointer',
        
    }
    const visibleStyle = {
        width: '20%',
        height: '30px',
        //backgroundColor: '#5da1f6',
        //border: '2px solid #1e7cf0ff',
        cursor: 'pointer'
    }
    const removeStyle = {
        width: '20%',
        height: '30px',
        //backgroundColor: '#f76a6a',
        //border: '2px solid #ff0000',
        cursor: 'pointer'
    }
    return (
        <div style={{ width: '200px' }}>
            <InputLabel htmlFor='layers'>Layers:</InputLabel>
            <div id='layers'>
                
                <Button variant='outlined' style={{ ...layerStyle }} onClick={() => addLayer()}>+</Button>
                {
                    layers.slice(0).reverse().map((layer, index) => {
                    return layer 
                    ? 
                        <ButtonGroup key={layers.length-1-index} style={{width: '100%'}}>
                            <Button
                                variant={selectedLayer === layers.length-1-index ? 'contained' : 'outlined' }
                                style={{ ...layerStyle}}
                                onClick={() => setSelectedLayer(layers.length-1-index)}
                                >
                                    {`Layer: ${layers.length-1-index}`}
                            </Button>
                            <Button variant='contained' color={layer.visible ? 'info' : 'secondary'} style={visibleStyle} onClick={() => toggleLayer(layers.length-1-index)}>{layer.visible ? '👁' : '-'}</Button>
                            <Button variant='contained' color='error' style={removeStyle} onClick={() => removeLayer(layers.length-1-index)}>x</Button>
                        </ButtonGroup>
                    
                    : null
                    })
                }
               
            </div>
        </div>
    )
}

export default LayerSelector