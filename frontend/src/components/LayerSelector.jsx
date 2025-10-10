import {
    InputLabel,
    Button,
    ButtonGroup,
} from '@mui/material'

const LayerSelector = ({ layers, selectedLayer, setSelectedLayer, addLayer, removeLayer, toggleLayer }) => {
    const layerStyle = {
        width: '100%',
        height: '30px',
        cursor: 'pointer',

    }
    const visibleStyle = {
        width: '20%',
        height: '30px',
        cursor: 'pointer'
    }
    const removeStyle = {
        width: '20%',
        height: '30px',
        cursor: 'pointer'
    }
    return (
        <div style={{ width: '200px' }}>
            <InputLabel data-testid='layer-selector-title'>Layers:</InputLabel>
            <div id='layers'>

                <Button data-testid='layer-add' variant='outlined' style={{ ...layerStyle }} onClick={() => addLayer()}>+</Button>
                {
                    layers.slice(0).reverse().map((layer, index) => {
                        return layer
                            ?
                            <ButtonGroup key={layers.length-1-index} style={{ width: '100%' }}>
                                <Button
                                    data-testid={`layer-${layers.length-1-index}-select-button`}
                                    variant={selectedLayer === layers.length-1-index ? 'contained' : 'outlined' }
                                    style={{ ...layerStyle }}
                                    onClick={() => setSelectedLayer(layers.length-1-index)}
                                >
                                    {`Layer: ${layers.length-1-index}`}
                                </Button>
                                <Button data-testid={`layer-${layers.length-1-index}-hide-button`} variant='contained' color={layer.visible ? 'info' : 'secondary'} style={visibleStyle} onClick={() => toggleLayer(layers.length-1-index)}>{layer.visible ? '👁' : '-'}</Button>
                                <Button data-testid={`layer-${layers.length-1-index}-delete-button`} variant='contained' color='error' style={removeStyle} onClick={() => removeLayer(layers.length-1-index)}>x</Button>
                            </ButtonGroup>
                            : null
                    })
                }

            </div>
        </div>
    )
}

export default LayerSelector