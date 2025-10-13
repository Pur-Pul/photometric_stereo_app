import Plot from 'react-plotly.js'
import { useEffect, useState, useRef } from 'react'
import React from 'react'
import Sphere from '../utils/Sphere'
import Vector3 from '../utils/Vector3'
import { CircularProgress } from '@mui/material'

class PersistPlot extends React.Component {
    constructor(props) {
        super(props)
        this.state = { data: [], layout: props.layout, frames: props.frames, config: props.config, cursor: 'pointer' }
    }

    render() {
        return (
            <div
                onPointerDown={() => {
                    if (this.state.cursor === 'grab') {
                        this.setState({ ...this.state, cursor: 'grabbing' })
                    }
                }}
                onPointerUp={() => {
                    if (this.state.cursor === 'grabbing') {
                        this.setState({ ...this.state, cursor: 'grab' })
                    }
                }}
            >
                <Plot
                    data={this.props.data}
                    layout={this.state.layout}
                    frames={this.state.frames}
                    config={this.state.config}
                    onInitialized={(figure) => {
                        this.setState(figure)
                    }}
                    onUpdate={(figure) => {
                        if (JSON.stringify(figure.layout) !== JSON.stringify(this.state.layout)) {
                            this.setState(figure)
                        }
                    }}
                    style={{ cursor: this.state.cursor, border: 'solid gray 1px', borderRadius:5 }}

                    onClick={(e) => {
                        if (this.props.setLightDir) {
                            const dir = new Vector3(
                                e.points[0].x,
                                e.points[0].z,
                                e.points[0].y
                            ).normalize(-1)
                            if (dir.norm() !== 0) {
                                this.props.setLightDir(dir)
                            }
                        }
                    }}
                    onHover={() => {
                        if (this.state.cursor !== 'cell') {
                            this.setState({ ...this.state, cursor: 'cell' })
                        }
                    }}
                    onUnhover={() => {
                        if (this.state.cursor !== 'grab') {
                            this.setState({ ...this.state, cursor: 'grab' })
                        }
                    }}
                />
            </div>
        )
    }
}

const generateLightLines = (lightDir, width, height) => {
    const roots = [
        new Vector3(-width/3,  0,          0),
        new Vector3(-width/3,  0,  -height/3),
        new Vector3(0,         0,  -height/3),
        new Vector3(width/3,   0,  -height/3),
        new Vector3(width/3,   0,  0),
        new Vector3(width/3,   0,  height/3),
        new Vector3(0,         0,  height/3),
        new Vector3(-width/3,  0,  height/3),
    ]
    return roots.map((root) => {
        const length = Math.max(width, height)
        const lightDirFlipped = new Vector3(lightDir.x, lightDir.z, lightDir.y)
        const light_start = root.sub(lightDirFlipped.scalar(length))
        return {
            type: 'scatter3d',
            mode: 'lines',
            x: [light_start.x, root.x],
            y: [light_start.y, root.y],
            z: [light_start.z, root.z],
            line: {
                width: 6,
                color: 'rgba(255, 255, 0, 0.5)'
            },
            hoverinfo: 'none'
        }
    })

}

const getPixels = (url, width, height, canvas, context) => {
    var img = new Image()
    img.src = url
    canvas.width=width
    canvas.height=height
    context.drawImage(img, 0, 0, width, height)
    const raw_data = context.getImageData(0, 0, width, height).data
    const pixels = (new Array(height).fill(null)).map(() => new Array(width))

    for (var i = 0; i < raw_data.length; i+=4) {
        const pixel_i = Math.floor(i/4)
        pixels[Math.floor(pixel_i/width)][pixel_i % width] = raw_data[i]
    }
    return pixels
}

const SIZE = 100

const LightPlot = ({ file, lightDir, setLightDir }) => {
    const [lightPos, setLightPos] = useState(new Vector3(0,0,0))
    const [colors, setColors] = useState([])
    const [radius, setRadius] = useState(1)

    const planeRef = useRef(null)
    const sphereRef = useRef(null)

    const canvasRef = useRef(document.createElement('canvas'))

    useEffect(() => {
        const aspectRatio = file.width/file.height
        const width = Math.round(aspectRatio*SIZE)
        const height = SIZE
        const canvas = canvasRef.current
        const context = canvas.getContext('2d', { willReadFrequently: true })
        const radius = Math.max(0.5 * SIZE * aspectRatio, 0.5 * SIZE)

        planeRef.current = new Array(height).fill(null).map(() => new Array(width).fill(0))
        sphereRef.current = new Sphere(3, radius)

        setRadius(radius)
        setColors(getPixels(file.image, width, height, canvas, context))
    }, [file])

    useEffect(() => {
        setLightPos(lightDir.scalar(-radius))
    }, [lightDir, radius])



    if (!planeRef.current || !sphereRef.current) { return <CircularProgress />}

    return (
        <PersistPlot
            data = {[
                {
                    type: 'mesh3d',
                    x: sphereRef.current.sphere_vertices.map((vertex) => vertex.x),
                    y: sphereRef.current.sphere_vertices.map((vertex) => vertex.y),
                    z: sphereRef.current.sphere_vertices.map((vertex) => vertex.z),
                    i: sphereRef.current.sphere_i,
                    j: sphereRef.current.sphere_j,
                    k: sphereRef.current.sphere_k,
                    color: 'rgb(0,0,255)',
                    opacity: 0.2,
                    flatshading: true,
                    hoverinfo: 'none',
                    hoverongaps: true
                },
                {
                    type: 'surface',
                    x: planeRef.current.map((row, y) => row.map((_, x) => row.length/2-x)),
                    y: planeRef.current,
                    z: planeRef.current.map((row, y) => row.map((_, x) => y - planeRef.current.length/2)),

                    surfacecolor: colors,
                    showscale: false,
                    hoverinfo: 'none',
                    colorscale: 'Greys'
                },
                {
                    type: 'scatter3d',
                    mode: 'markers',
                    x: [lightPos.x],
                    y: [lightPos.z],
                    z: [lightPos.y],
                    marker: {
                        SIZE: 12,
                        color: 'rgba(255, 200, 0, 1)',
                        opacity: 0.8
                    },
                    hovertemplate: `light direction<br>(${lightDir.x.toFixed(2)}, ${lightDir.y.toFixed(2)}, ${lightDir.z.toFixed(2)})<br>`
                },
                ...generateLightLines(lightDir, SIZE * (file.width/file.height), SIZE)
            ]}
            layout = {{
                title: { text: 'Light direction.' },
                xaxis: { autorange: 'reversed' },
                zaxis: { autorange: 'reversed' },
                scene: {
                    aspectmode:'manual',
                    aspectratio: { x:1, y:1, z:1 },
                    camera: { eye: { x: 0, y: -2, z: 0 } },
                    yaxis: {
                        title: { text: 'z' },
                        showticklabels: false,
                        range: [-radius, radius]
                    },
                    zaxis: {
                        title: { text: 'y' },
                        showticklabels: false,
                        range: [radius, -radius]

                    },
                    xaxis: {
                        showticklabels: false,
                        range: [radius, -radius]
                    },
                },
                showlegend: false,
                autoSIZE: false,
                width: 500,
                height: 500,
                margin: { l: 35, r: 0, b: 25, t: 25 },
            }}
            setLightDir = { setLightDir }
        />
    )
}

export default LightPlot